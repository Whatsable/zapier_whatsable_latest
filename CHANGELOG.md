## 4.0.1

Fix trigger sample data and auth help.

1. Fix trigger/whatsable_message_trigger — phone_number sample uses string type; all user_id samples use UUID strings
2. Fix authentication — add dashboard link for API key help text

## 4.0.0

Major release with dedicated actions and an updated message trigger.

1. Update create/send_whatsapp_message — send WhatsApp templates and non-template messages for Notifyer, Notifier, and WhatsAble
2. Update create/schedule_follow_up_message — schedule template and non-template follow-ups with relative/specific timing and reply/label conditions
3. Update create/update_contact — add display name, note, and label dropdowns for add/remove labels
4. Update create/get_message_delivery_status — check delivery/read status by message ID
5. Update create/send_whatsapp_message_to_group — send group messages for WhatsAble
6. Update trigger/whatsable_message_trigger — unified incoming/outgoing webhook trigger with updated sample data, is_scheduled field, and UUID user_id samples
7. Fix create/update_contact — restore label dropdowns for Add Label and Remove Label fields
8. Fix trigger/whatsable_message_trigger — phone_number sample uses string type to match output field
9. Fix authentication — add dashboard link for API key help text

Removed legacy create/perform_whatsable_operation. Existing Zaps using that action must be recreated with the dedicated actions above.

## 3.0.3

Maintenance release with trigger sample updates and scheduling improvements.
