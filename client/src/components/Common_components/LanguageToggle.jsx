import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

export default function LanguageToggle() {
  const { i18n } = useTranslation(); // 👈 subscribe to language changes
  const current = i18n.language || "en";

  const toggleLanguage = () => {
    const next = current === "en" ? "bn" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
  };

  return (
    <Button variant="submit" onClick={toggleLanguage}>
      {current === "en" ? "বাংলা" : "English"}
    </Button>
  );
}
