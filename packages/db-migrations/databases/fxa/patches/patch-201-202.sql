-- Add the security event name recorded when a user deletes their Sync data
-- from Settings.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('201');

INSERT INTO securityEventNames (name) VALUES ('account.sync_data_deleted');

UPDATE dbMetadata SET value = '202' WHERE name = 'schema-patch-level';
