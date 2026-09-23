/**
 * Test ids the app exposes (Compose testTag surfaced as resource-id, ABMR commit b589b43).
 * Only the ones the suite uses are listed - the app ships ~229 in total; add as specs grow.
 */
export const Ids = {
  login: {
    screen: 'login_screen',
    email: 'login_email_input',
    password: 'login_password_input',
    signIn: 'login_sign_in_button',
    loading: 'login_loading',
    version: 'login_version_text',
    language: 'login_language_button',
    callBackOffice: 'login_call_back_office_button',
  },
  policy: {
    screen: 'policy_screen',
    accept: 'policy_accept_button',
  },
  otp: {
    screen: 'otp_screen',
    driverName: 'otp_driver_name_input',
    mobile: 'otp_mobile_input',
    code: 'otp_code_input',
    confirm: 'otp_confirm_button',
    request: 'otp_request_button',
    changePhone: 'otp_change_phone_button',
    instruction: 'otp_instruction_text',
  },
  home: {
    view: 'home_view',
    bottomNav: 'main_bottom_nav',
    greeting: 'main_greeting_text',
    readySwitch: 'ready_switch',
    noJob: 'home_no_job_text',
  },
  vehicle: {
    view: 'vehicle_view',
    list: 'vehicle_list',
    row: 'vehicle_row_button',
  },
} as const;

/** UiAutomator selector for an exact resource-id. */
export const byId = (resourceId: string) => `android=new UiSelector().resourceId("${resourceId}")`;
