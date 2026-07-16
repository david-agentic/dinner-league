import { neon } from '@neondatabase/serverless';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`;
  await sql`CREATE TABLE IF NOT EXISTS people (
    id TEXT NOT NULL, group_id TEXT NOT NULL REFERENCES groups(id),
    name TEXT NOT NULL, initial TEXT NOT NULL, can_pay BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (group_id, id))`;
  await sql`CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY, group_id TEXT NOT NULL REFERENCES groups(id),
    meal_date DATE NOT NULL, types JSONB NOT NULL DEFAULT '[]',
    total NUMERIC NOT NULL, attendees JSONB NOT NULL, payer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now())`;
  const g = await sql`SELECT id FROM groups WHERE id = 'main'`;
  if (g.length === 0) {
    await sql`INSERT INTO groups (id, name) VALUES ('main', 'Dinner League')`;
    const seed = [
      ['daood','Daood','D',true],['mudassir','Mudassir','M',true],
      ['talha','Talha','T',true],['khan','Khan','K',true],['saad','Saad','S',false]
    ];
    for (const [id,name,initial,canPay] of seed) {
      await sql`INSERT INTO people (id, group_id, name, initial, can_pay)
        VALUES (${id}, 'main', ${name}, ${initial}, ${canPay})`;
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

  const sql = neon(env.DATABASE_URL);

  try {
    if (route === 'state' && request.method === 'GET') {
      await ensureSchema(sql);
      const people = await sql`SELECT id, name, initial, can_pay FROM people WHERE group_id = 'main' ORDER BY name`;
      const meals = await sql`SELECT id, meal_date::text AS date, types, total::float AS total,
        attendees, payer FROM meals WHERE group_id = 'main' ORDER BY meal_date, id`;
      return json({ people, meals });
    }

    if (route === 'meals' && request.method === 'POST') {
      const b = await request.json();
      if (!b.date || !b.total || b.total <= 0) return json({ error: 'invalid_bill' }, 400);
      if (!Array.isArray(b.att) || b.att.length === 0) return json({ error: 'no_attendees' }, 400);
      const ppl = await sql`SELECT id, can_pay FROM people WHERE group_id = 'main'`;
      const canPay = new Set(ppl.filter(p => p.can_pay).map(p => p.id));
      const payers = b.att.filter(id => canPay.has(id));
      if (payers.length === 0) return json({ error: 'no_payer_attended' }, 400);
      if (!b.payer || !canPay.has(b.payer) || !b.att.includes(b.payer))
        return json({ error: 'invalid_payer' }, 400);
      const types = JSON.stringify(Array.isArray(b.types) ? b.types : []);
      const att = JSON.stringify(b.att);
      const r = await sql`INSERT INTO meals (group_id, meal_date, types, total, attendees, payer)
        VALUES ('main', ${b.date}, ${types}::jsonb, ${b.total}, ${att}::jsonb, ${b.payer})
        RETURNING id`;
      return json({ ok: true, id: r[0].id });
    }

    if (route.startsWith('meals/') && request.method === 'DELETE') {
      const id = parseInt(route.split('/')[1], 10);
      if (!id) return json({ error: 'bad_id' }, 400);
      await sql`DELETE FROM meals WHERE id = ${id} AND group_id = 'main'`;
      return json({ ok: true });
    }

    return json({ error: 'not_found' }, 404);
  } catch (e) {
    return json({ error: 'server_error', detail: String(e.message || e) }, 500);
  }
}
