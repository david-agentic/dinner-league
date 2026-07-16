// Zero-dependency Neon client over the Neon HTTP SQL API.
function neonQ(dbUrl) {
  const host = new URL(dbUrl.replace(/^postgres(ql)?:\/\//, 'https://')).hostname;
  return async (query, params = []) => {
    const r = await fetch(`https://${host}/sql`, {
      method: 'POST',
      headers: {
        'Neon-Connection-String': dbUrl,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, params })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'db_error');
    return d.rows || [];
  };
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

async function ensureSchema(q) {
  await q(`CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS people (
    id TEXT NOT NULL, group_id TEXT NOT NULL REFERENCES groups(id),
    name TEXT NOT NULL, initial TEXT NOT NULL, can_pay BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (group_id, id))`);
  await q(`CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY, group_id TEXT NOT NULL REFERENCES groups(id),
    meal_date DATE NOT NULL, types JSONB NOT NULL DEFAULT '[]',
    total NUMERIC NOT NULL, attendees JSONB NOT NULL, payer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY, group_id TEXT NOT NULL REFERENCES groups(id),
    settle_date DATE NOT NULL, from_person TEXT NOT NULL, to_person TEXT NOT NULL,
    amount NUMERIC NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`);
  await q(`ALTER TABLE people ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false`);
  const g = await q(`SELECT id FROM groups WHERE id = 'main'`);
  if (g.length === 0) {
    await q(`INSERT INTO groups (id, name) VALUES ('main', 'Dinner League')`);
    const seed = [
      ['daood','Daood','D',true],['mudassir','Mudassir','M',true],
      ['talha','Talha','T',true],['khan','Khan','K',true],['saad','Saad','S',false]
    ];
    for (const [id, name, initial, canPay] of seed) {
      await q(`INSERT INTO people (id, group_id, name, initial, can_pay)
               VALUES ($1, 'main', $2, $3, $4)`, [id, name, initial, canPay]);
    }
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\//, '');

  const pin = request.headers.get('x-pin') || '';
  if (!env.APP_PIN || pin !== env.APP_PIN) return json({ error: 'bad_pin' }, 401);
  if (!env.DATABASE_URL) return json({ error: 'no_database_url' }, 500);

  const q = neonQ(env.DATABASE_URL);

  try {
    if (route === 'health' && request.method === 'GET') {
      const out = { has_db_url: !!env.DATABASE_URL, has_pin: !!env.APP_PIN };
      try { await q(`SELECT 1 AS ok`); out.db = 'connected'; }
      catch (e) { out.db = 'FAILED: ' + String(e.message || e).slice(0, 200); }
      return json(out);
    }

    if (route === 'state' && request.method === 'GET') {
      await ensureSchema(q);
      const people = await q(
        `SELECT id, name, initial, can_pay, archived FROM people WHERE group_id = 'main' ORDER BY name`);
      const meals = await q(
        `SELECT id, meal_date::text AS date, types, total::float AS total,
                attendees, payer
         FROM meals WHERE group_id = 'main' ORDER BY meal_date, id`);
      const settlements = await q(
        `SELECT id, settle_date::text AS date, from_person AS "from", to_person AS "to",
                amount::float AS amount, recorded_by AS "by"
         FROM settlements WHERE group_id = 'main' ORDER BY settle_date, id`);
      return json({ people, meals, settlements });
    }

    if (route === 'meals' && request.method === 'POST') {
      const b = await request.json();
      if (!b.date || !b.total || b.total <= 0) return json({ error: 'invalid_bill' }, 400);
      if (!Array.isArray(b.att) || b.att.length === 0) return json({ error: 'no_attendees' }, 400);
      const ppl = await q(`SELECT id, can_pay, archived FROM people WHERE group_id = 'main'`);
      const canPay = new Set(ppl.filter(p => p.can_pay && !p.archived).map(p => p.id));
      const known = new Set(ppl.filter(p => !p.archived).map(p => p.id));
      if (!b.att.every(id => known.has(id))) return json({ error: 'unknown_person' }, 400);
      const payers = b.att.filter(id => canPay.has(id));
      if (payers.length === 0) return json({ error: 'no_payer_attended' }, 400);
      if (!b.payer || !canPay.has(b.payer) || !b.att.includes(b.payer))
        return json({ error: 'invalid_payer' }, 400);
      const r = await q(
        `INSERT INTO meals (group_id, meal_date, types, total, attendees, payer)
         VALUES ('main', $1, $2::jsonb, $3, $4::jsonb, $5) RETURNING id`,
        [b.date, JSON.stringify(Array.isArray(b.types) ? b.types : []),
         b.total, JSON.stringify(b.att), b.payer]);
      return json({ ok: true, id: r[0].id });
    }

    if (route === 'people' && request.method === 'POST') {
      const b = await request.json();
      const name = (b.name || '').trim();
      if (!name || name.length > 30) return json({ error: 'invalid_name' }, 400);
      let id = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'member';
      const existing = await q(`SELECT id FROM people WHERE group_id = 'main'`);
      const ids = new Set(existing.map(x => x.id));
      while (ids.has(id)) id = id + Math.floor(Math.random() * 10);
      await q(`INSERT INTO people (id, group_id, name, initial, can_pay)
               VALUES ($1, 'main', $2, $3, $4)`,
        [id, name, name[0].toUpperCase(), b.can_pay !== false]);
      return json({ ok: true, id });
    }

    if (route.startsWith('people/') && request.method === 'PATCH') {
      const id = route.split('/')[1];
      const b = await request.json();
      const cur = await q(`SELECT * FROM people WHERE group_id = 'main' AND id = $1`, [id]);
      if (!cur.length) return json({ error: 'not_found' }, 404);
      const name = b.name !== undefined ? String(b.name).trim().slice(0, 30) : cur[0].name;
      if (!name) return json({ error: 'invalid_name' }, 400);
      const canPay = b.can_pay !== undefined ? !!b.can_pay : cur[0].can_pay;
      const archived = b.archived !== undefined ? !!b.archived : cur[0].archived;
      await q(`UPDATE people SET name = $1, initial = $2, can_pay = $3, archived = $4
               WHERE group_id = 'main' AND id = $5`,
        [name, name[0].toUpperCase(), canPay, archived, id]);
      return json({ ok: true });
    }

    if (route.startsWith('meals/') && request.method === 'PATCH') {
      const id = parseInt(route.split('/')[1], 10);
      if (!id) return json({ error: 'bad_id' }, 400);
      const b = await request.json();
      if (!b.date || !b.total || b.total <= 0) return json({ error: 'invalid_bill' }, 400);
      if (!Array.isArray(b.att) || b.att.length === 0) return json({ error: 'no_attendees' }, 400);
      const ppl = await q(`SELECT id, can_pay FROM people WHERE group_id = 'main'`);
      const canPay = new Set(ppl.filter(p => p.can_pay).map(p => p.id));
      const known = new Set(ppl.map(p => p.id));
      if (!b.att.every(x => known.has(x))) return json({ error: 'unknown_person' }, 400);
      const payers = b.att.filter(x => canPay.has(x));
      if (!payers.length) return json({ error: 'no_payer_attended' }, 400);
      if (!b.payer || !canPay.has(b.payer) || !b.att.includes(b.payer))
        return json({ error: 'invalid_payer' }, 400);
      await q(`UPDATE meals SET meal_date=$1, types=$2::jsonb, total=$3, attendees=$4::jsonb, payer=$5
               WHERE id=$6 AND group_id='main'`,
        [b.date, JSON.stringify(b.types||[]), b.total, JSON.stringify(b.att), b.payer, id]);
      return json({ ok: true });
    }

    if (route === 'settlements' && request.method === 'POST') {
      const b = await request.json();
      if (!b.date || !b.amount || b.amount <= 0) return json({ error: 'invalid_amount' }, 400);
      if (!b.from || !b.to || b.from === b.to) return json({ error: 'invalid_parties' }, 400);
      const ppl = await q(`SELECT id, can_pay FROM people WHERE group_id = 'main'`);
      const canPay = new Set(ppl.filter(p => p.can_pay).map(p => p.id));
      if (!canPay.has(b.from) || !canPay.has(b.to)) return json({ error: 'guest_cannot_settle' }, 400);
      // Rule: the receiver (to) may not be the recorder unless explicitly flagged.
      // Normal path: recorder pays (from). Receiver-recorded settlements are allowed but marked.
      const recordedBy = b.recorded_by || null;
      if (recordedBy && recordedBy === b.to && !b.receiver_override)
        return json({ error: 'receiver_cannot_record' }, 403);
      const r = await q(
        `INSERT INTO settlements (group_id, settle_date, from_person, to_person, amount, recorded_by)
         VALUES ('main', $1, $2, $3, $4, $5) RETURNING id`,
        [b.date, b.from, b.to, b.amount, recordedBy]);
      return json({ ok: true, id: r[0].id });
    }

    if (route.startsWith('settlements/') && request.method === 'DELETE') {
      const id = parseInt(route.split('/')[1], 10);
      if (!id) return json({ error: 'bad_id' }, 400);
      await q(`DELETE FROM settlements WHERE id = $1 AND group_id = 'main'`, [id]);
      return json({ ok: true });
    }

    if (route.startsWith('meals/') && request.method === 'DELETE') {
      const id = parseInt(route.split('/')[1], 10);
      if (!id) return json({ error: 'bad_id' }, 400);
      await q(`DELETE FROM meals WHERE id = $1 AND group_id = 'main'`, [id]);
      return json({ ok: true });
    }

    return json({ error: 'not_found' }, 404);
  } catch (e) {
    return json({ error: 'server_error', detail: String(e.message || e) }, 500);
  }
}
