import i18n from '@renderer/i18n/resolver'
import { BACKUP_ACTIVE_WRITERS_ERROR_CODE } from '@shared/types/backup'

type BackupErrorFallbackKey =
  | 'error.backup.file_format'
  | 'message.backup.failed'
  | 'message.restore.failed'
  | 'settings.data.local.backup.manager.restore.error'
  | 'settings.data.webdav.backup.manager.restore.error'
  | 'settings.data.webdav.backup.manager.fetch.error'
  | 'settings.data.webdav.backup.manager.delete.error'

// error.code is lost crossing IPC, so match on message text. Chain-trust
// failures only — expiry/hostname issues need a cert fix, not a bypass.
const TLS_CERTIFICATE_FAILURE_PATTERNS = [
  'unable to verify the first certificate',
  'unable to get local issuer certificate',
  'unable to get issuer certificate',
  'self-signed certificate',
  'self signed certificate'
]

function isTlsCertificateFailure(error: unknown): boolean {
  if (!(error instanceof Error) || !error.message) return false
  const message = error.message.toLowerCase()
  return TLS_CERTIFICATE_FAILURE_PATTERNS.some((pattern) => message.includes(pattern))
}

// Closed set: every key this mapper can select, so a typo cannot compile.
type BackupMessageKey =
  | BackupErrorFallbackKey
  | 'backup.error.active_data_writers'
  | 'backup.error.webdav_tls_certificate'

export function getLocalizedBackupErrorMessage(
  error: unknown,
  fallbackKey: BackupErrorFallbackKey = 'message.backup.failed',
  options?: { tlsCertificateHint?: boolean }
): string {
  let messageKey: BackupMessageKey = fallbackKey
  if (error instanceof Error && error.message.includes(BACKUP_ACTIVE_WRITERS_ERROR_CODE)) {
    messageKey = 'backup.error.active_data_writers'
  } else if (options?.tlsCertificateHint === true && isTlsCertificateFailure(error)) {
    // Scoped to WebDAV callers: the guidance points at the WebDAV self-signed
    // switch, which does not exist for S3/local/nutstore transports.
    messageKey = 'backup.error.webdav_tls_certificate'
  }

  return i18n.t(messageKey)
}
