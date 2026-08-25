# db — schema and seed

Ordered migrations and seed data for the single Postgres instance: lots, devices, readings, anchors.

`init.sql` is the current state of things and runs **only on a fresh volume**, which is not a
migration story and does not survive a versioned system (`V-7`). Replacing it with ordered,
re-runnable migrations is the first piece of work here.

Discharges: `V-7`, `T-5`.
