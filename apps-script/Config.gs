/** Configuration for a separate installation. No production identifiers. */
function sdcConfig_(name) {
  return String(PropertiesService.getScriptProperties().getProperty(name) || '').trim();
}
function sdcRevisoresConfig_() {
  return sdcConfig_('SDC_REVIEWER_EMAILS').split(',')
    .map(email => email.trim().toLowerCase()).filter(Boolean);
}
