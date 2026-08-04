-- ============================================================================
-- 0002_ticket_images_storage.sql
-- Bucket privat pentru fotografiile atașate sesizărilor + politici de acces.
-- Convenție de path: "{auth.uid()}/{ticket_id}-{nume_fișier}".
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('ticket-images', 'ticket-images', false)
on conflict (id) do nothing;

create policy "ticket_images_insert_own_folder" on storage.objects
  for insert
  with check (
    bucket_id = 'ticket-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Autorul poate revedea propriile poze; administratorii (orice bloc admin)
-- pot revedea orice poză de sesizare — simplificare acceptabilă: tot
-- conținutul unei sesizări e oricum vizibil administratorilor prin RLS pe
-- `tickets`, iar storage.objects nu poate face join direct cu `apartment_id`.
create policy "ticket_images_select_own_or_admin" on storage.objects
  for select
  using (
    bucket_id = 'ticket-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.current_user_role() = 'ADMINISTRATOR'
    )
  );
