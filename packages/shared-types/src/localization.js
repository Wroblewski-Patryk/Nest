const SUPPORTED_LANGUAGES = ["en", "pl"];

const DEFAULT_LOCALES = {
  en: "en-US",
  pl: "pl-PL",
};

const DICTIONARY = {
  en: {
    "app.kicker": "Nest LifeOS MVP",
    "public.kicker": "Life management in one calm place",
    "public.nav.welcome": "Welcome",
    "public.nav.sign_in": "Sign in",
    "public.nav.register": "Register",
    "public.footer.runtime": "Web app: http://localhost:9001 | API: http://localhost:9000",
    "auth.title.login": "Sign in to your private workspace",
    "auth.title.register": "Create your Nest account",
    "auth.subtitle": "Sign in or create an account, then finish onboarding before entering your dashboard.",
    "auth.section.language": "Language",
    "auth.section.account": "Account access",
    "auth.section.status": "Status",
    "auth.section.error": "Something went wrong",
    "auth.switch_to_register": "Create account instead",
    "auth.switch_to_login": "Use existing account",
    "auth.field.name": "Name",
    "auth.field.email": "Email",
    "auth.field.password": "Password",
    "auth.field.password_confirm": "Confirm password",
    "auth.action.sign_in": "Sign in",
    "auth.action.signing_in": "Signing in...",
    "auth.action.create_account": "Create account",
    "auth.action.creating_account": "Creating account...",
    "auth.feedback.default": "Sign in to access your private workspace.",
    "auth.feedback.signed_in": "Signed in. Redirecting...",
    "auth.feedback.created": "Account created. Redirecting...",
    "auth.error.password_mismatch": "The password confirmation does not match.",
    "auth.error.login_invalid": "We couldn't sign you in. Check your email and password and try again.",
    "auth.error.login_generic": "We couldn't sign you in right now. Please try again in a moment.",
    "auth.error.register_generic": "We couldn't create your account right now. Please try again in a moment.",
    "auth.language.helper": "Choose the language for sign-in and onboarding. You can change it later in settings.",
    "onboarding.title": "Finish your account setup",
    "onboarding.subtitle": "Choose your display name and language before entering the dashboard.",
    "onboarding.required.display_name": "Required field",
    "onboarding.required.language": "Required field",
    "onboarding.apply_mode": "Applies",
    "onboarding.apply_mode.value": "Immediately",
    "onboarding.panel.title": "Account setup",
    "onboarding.field.display_name": "Display name",
    "onboarding.field.language": "Language",
    "onboarding.action.continue": "Continue",
    "onboarding.feedback.default": "Complete onboarding with your display name and language.",
    "onboarding.feedback.success": "Setup saved. Redirecting to your dashboard...",
    "onboarding.error.generic": "We couldn't save your setup right now. Please try again.",
  },
  pl: {
    "app.kicker": "Nest LifeOS MVP",
    "public.kicker": "Zarzadzaj zyciem spokojnie, w jednym miejscu",
    "public.nav.welcome": "Start",
    "public.nav.sign_in": "Zaloguj sie",
    "public.nav.register": "Zarejestruj sie",
    "public.footer.runtime": "Web app: http://localhost:9001 | API: http://localhost:9000",
    "auth.title.login": "Zaloguj sie do swojego prywatnego workspace",
    "auth.title.register": "Utworz konto Nest",
    "auth.subtitle": "Zaloguj sie albo zaloz konto, a potem dokonczy onboarding przed wejsciem do dashboardu.",
    "auth.section.language": "Jezyk",
    "auth.section.account": "Dostep do konta",
    "auth.section.status": "Status",
    "auth.section.error": "Cos poszlo nie tak",
    "auth.switch_to_register": "Utworz nowe konto",
    "auth.switch_to_login": "Mam juz konto",
    "auth.field.name": "Imie",
    "auth.field.email": "Email",
    "auth.field.password": "Haslo",
    "auth.field.password_confirm": "Powtorz haslo",
    "auth.action.sign_in": "Zaloguj sie",
    "auth.action.signing_in": "Logowanie...",
    "auth.action.create_account": "Utworz konto",
    "auth.action.creating_account": "Tworzenie konta...",
    "auth.feedback.default": "Zaloguj sie, aby wejsc do swojego prywatnego workspace.",
    "auth.feedback.signed_in": "Zalogowano. Przekierowuje...",
    "auth.feedback.created": "Konto utworzone. Przekierowuje...",
    "auth.error.password_mismatch": "Potwierdzenie hasla nie zgadza sie.",
    "auth.error.login_invalid": "Nie udalo sie zalogowac. Sprawdz email i haslo, a potem sproboj ponownie.",
    "auth.error.login_generic": "Nie udalo sie teraz zalogowac. Sprobuj ponownie za chwile.",
    "auth.error.register_generic": "Nie udalo sie teraz utworzyc konta. Sprobuj ponownie za chwile.",
    "auth.language.helper": "Wybierz jezyk logowania i onboardingu. Pozniej zmienisz go w ustawieniach.",
    "onboarding.title": "Dokoncz konfiguracje konta",
    "onboarding.subtitle": "Ustaw nazwe wyswietlana i jezyk, zanim wejdziesz do dashboardu.",
    "onboarding.required.display_name": "Pole wymagane",
    "onboarding.required.language": "Pole wymagane",
    "onboarding.apply_mode": "Zastosowanie",
    "onboarding.apply_mode.value": "Od razu",
    "onboarding.panel.title": "Konfiguracja konta",
    "onboarding.field.display_name": "Nazwa wyswietlana",
    "onboarding.field.language": "Jezyk",
    "onboarding.action.continue": "Dalej",
    "onboarding.feedback.default": "Dokoncz onboarding, ustawiajac nazwe wyswietlana i jezyk.",
    "onboarding.feedback.success": "Ustawienia zapisane. Przekierowuje do dashboardu...",
    "onboarding.error.generic": "Nie udalo sie zapisac ustawien. Sprobuj ponownie.",
  },
};

export function resolveLanguage(value) {
  if (typeof value === "string" && SUPPORTED_LANGUAGES.includes(value)) {
    return value;
  }

  return "en";
}

export function resolveLocale(language, override) {
  if (typeof override === "string" && override.length > 0) {
    return override;
  }

  const safeLanguage = resolveLanguage(language);
  return DEFAULT_LOCALES[safeLanguage];
}

export function translate(key, language, fallback = key) {
  const safeLanguage = resolveLanguage(language);
  return DICTIONARY[safeLanguage]?.[key] ?? DICTIONARY.en?.[key] ?? fallback;
}

export function formatLocalizedDateTime(value, language, localeOverride) {
  const locale = resolveLocale(language, localeOverride);
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
