-- Phase 1 — Géolocalisation des biens (base recherche carto phases 8-9).
-- Colonne nullable : aucun impact sur le CRUD existant.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS geo GEOGRAPHY(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_properties_geo ON properties USING GIST (geo);
