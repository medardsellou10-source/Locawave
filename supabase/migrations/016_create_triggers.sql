-- Fonction trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur toutes les tables avec updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON rent_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index pour les requêtes fréquentes
CREATE INDEX idx_properties_org ON properties(org_id);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_org ON units(org_id);
CREATE INDEX idx_tenants_org ON tenants(org_id);
CREATE INDEX idx_leases_org ON leases(org_id);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_rent_schedules_lease ON rent_schedules(lease_id);
CREATE INDEX idx_rent_schedules_org ON rent_schedules(org_id);
CREATE INDEX idx_rent_schedules_due_date ON rent_schedules(due_date);
CREATE INDEX idx_rent_schedules_status ON rent_schedules(status);
CREATE INDEX idx_payments_org ON payments(org_id);
CREATE INDEX idx_payments_schedule ON payments(rent_schedule_id);
CREATE INDEX idx_receipts_payment ON receipts(payment_id);
CREATE INDEX idx_activity_logs_org ON activity_logs(org_id);
CREATE INDEX idx_expenses_org ON expenses(org_id);
CREATE INDEX idx_expenses_property ON expenses(property_id);

-- Templates de notification par défaut (insérés via trigger à la création d'une org)
CREATE OR REPLACE FUNCTION create_default_notification_templates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_templates (org_id, type, message_template) VALUES
    (NEW.id, 'reminder_j5', 'Bonjour {prenom}, votre loyer de {montant} FCFA pour {bien} est dû dans 5 jours (le {date}). Wave : {wave_number}. Merci'),
    (NEW.id, 'reminder_j0', 'Bonjour {prenom}, votre loyer de {montant} FCFA est dû aujourd''hui. Merci de régler via Wave au {wave_number}.'),
    (NEW.id, 'reminder_j3_late', 'Bonjour {prenom}, votre loyer de {montant} FCFA est en retard de 3 jours. Merci de régulariser rapidement. Contact : {tel_proprietaire}'),
    (NEW.id, 'alert_landlord', 'Alerte Locawave : {count} loyer(s) impayé(s). Total impayé : {total} FCFA. Connexion : locawave.sn');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_templates
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_templates();
