CREATE TABLE notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON notification_templates
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
