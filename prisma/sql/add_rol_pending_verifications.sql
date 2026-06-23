-- Agrega el rol que se asignará al usuario cuando complete su registro con una
-- invitación. NULL = comportamiento histórico (se registra como 'estudiante').
-- Para invitaciones de staff (owner/admin/editor/moderator) se guarda ese rol y
-- el flujo de registro lo asigna al crear la cuenta.
ALTER TABLE pending_verifications
  ADD COLUMN IF NOT EXISTS rol VARCHAR(50);
