UPDATE "event_configurations"
SET
	"settings" = jsonb_set(
		"settings",
		'{entranceAnimation}',
		'{"enabled":true,"type":"clam","frequency":"always","durationMs":3100,"allowSkip":true,"primaryText":"LA PERLA","secondaryText":"BIRTHDAY NIGHT","showDate":true}'::jsonb
			|| COALESCE("settings"->'entranceAnimation', '{}'::jsonb)
			|| '{"enabled":true,"frequency":"always"}'::jsonb,
		true
	),
	"updated_at" = now()
WHERE "id" = 1;
