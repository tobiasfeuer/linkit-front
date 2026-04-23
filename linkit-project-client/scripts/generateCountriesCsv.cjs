const fs = require("fs");
const path = require("path");
const countries = require("i18n-iso-countries");

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/es.json"));

const namesEn = countries.getNames("en", { select: "official" });
const namesEs = countries.getNames("es", { select: "official" });

const legacyByCode = {
  AR: "Argentina",
  CO: "Colombia",
  UY: "Uruguay",
  CL: "Chile",
  BR: "Brasil",
  MX: "Mexico",
  VE: "Venezuela",
  PH: "Philippines",
  IN: "India",
  ZA: "South Africa",
  NG: "Nigeria",
  PE: "Peru",
  PY: "Paraguay",
  EC: "Ecuador",
  CR: "Costa rica",
  BO: "Bolivia",
  DO: "República Dominicana",
  HN: "Honduras",
  NI: "Nicaragua",
  PA: "Panama",
  ES: "España",
  GT: "Guatemala",
  PR: "Puerto Rico",
  AE: "Emiratos Arabes",
  US: "USA",
  AL: "Albania",
  LT: "Lithuania",
  CA: "Canada",
  PL: "Polonia",
};

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const rows = Object.keys(namesEn).map((code) => {
  const enName = namesEn[code] || "";
  const esName = namesEs[code] || enName;
  const legacy = legacyByCode[code];
  const optionLabelEs = legacy || esName;

  const aliases = [];
  if (legacy && legacy !== esName) aliases.push(esName);
  if (code === "US") aliases.push("Estados Unidos", "United States");
  if (code === "AE") aliases.push("United Arab Emirates");

  const legacyAliases = [...new Set(aliases.filter(Boolean))].join("|");

  return {
    optionGroup: "country",
    optionLabelEs,
    optionLabelEn: enName,
    isActive: "true",
    legacyAliases,
  };
});

rows.sort((a, b) => a.optionLabelEs.localeCompare(b.optionLabelEs, "es"));

const header = [
  "optionGroup",
  "optionLabelEs",
  "optionLabelEn",
  "isActive",
  "legacyAliases",
];

const csv = [
  header.join(","),
  ...rows.map((row) =>
    [
      row.optionGroup,
      row.optionLabelEs,
      row.optionLabelEn,
      row.isActive,
      row.legacyAliases,
    ]
      .map(escapeCsv)
      .join(",")
  ),
].join("\n");

const outputPath = path.resolve(
  __dirname,
  "../../../countries_options_airtable_all_250.csv"
);

fs.writeFileSync(outputPath, csv, "utf8");
console.log(`Generated ${rows.length} rows at ${outputPath}`);
