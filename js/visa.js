/* =========================================================
   VISA CHECKER
   Pick a passport, get the route in. Tourist travel only.
   Categories follow the rules published by the Bangladesh
   Department of Immigration and Passports, which change, so
   every answer ends at the same place: confirm with a mission.
   ========================================================= */
(function () {
  'use strict';

  const RULES = {
    free: {
      label: 'No visa needed',
      tone: 'good',
      stay: 'Up to 90 days, tourism',
      what: 'Your passport, valid at least six months, and a return or onward ticket. You will be given a tourist entry stamp at the border.',
      steps: [
        'Book flights and at least the first night of accommodation',
        'Carry proof of onward travel and funds, printed',
        'Arrive at any international airport or approved land port',
        'Get the entry stamp at immigration, no fee'
      ],
      fee: 'No fee',
      time: 'On arrival, minutes'
    },
    voa: {
      label: 'Visa on arrival',
      tone: 'good',
      stay: 'Up to 30 days, extendable in Dhaka',
      what: 'A landing visa, but you apply for it online first. Register at the Special Branch portal, submit the form with your photograph and passport bio page, then print the acknowledgement receipt and carry it. Issuing is still at the discretion of the immigration officer, and it only works arriving by air at Dhaka, Chattogram or Sylhet.',
      steps: [
        'Apply at voa.specialbranch.gov.bd and print the acknowledgement receipt',
        'Passport valid six months or more, with blank pages',
        'Return or onward ticket and a confirmed hotel booking',
        'On landing, follow the signs to the Visa on Arrival area in Arrivals',
        'Pay USD 50 in cash at the Sonali Bank counter and keep the receipt',
        'Join the queue beside the bank with the receipt, then go to immigration'
      ],
      fee: 'USD 50, cash only, plus processing',
      time: 'On arrival, 20 to 60 minutes'
    },
    mission: {
      label: 'Visa before you travel',
      tone: 'warn',
      stay: 'Usually 30 to 90 days, single or multiple entry',
      what: 'Apply to the Bangladesh High Commission, Embassy or Consulate that covers where you live. The application form is completed online first at visa.gov.bd, then submitted with your passport.',
      steps: [
        'Fill the form online at visa.gov.bd and print it',
        'Passport valid six months or more, plus photographs',
        'Flight booking, hotel booking and recent bank statements',
        'Submit in person or by post to your nearest mission',
        'Allow two to three weeks, longer in summer'
      ],
      fee: 'Varies by nationality and mission, commonly USD 50 to USD 160',
      time: '5 to 20 working days'
    },
    clearance: {
      label: 'Visa plus prior clearance',
      tone: 'warn',
      stay: 'Decided case by case',
      what: 'A visa must be applied for at a Bangladesh mission and referred to the Ministry of Home Affairs in Dhaka for security clearance before it can be issued.',
      steps: [
        'Start at least two months before you plan to travel',
        'Apply at the Bangladesh mission covering your country',
        'Expect to supply a detailed itinerary and a local reference',
        'Wait for clearance from Dhaka before booking anything you cannot change'
      ],
      fee: 'Varies, set by the mission',
      time: '6 to 12 weeks, sometimes longer'
    },
    none: {
      label: 'Entry not currently available',
      tone: 'bad',
      stay: 'Not applicable',
      what: 'Bangladesh does not currently issue tourist visas to holders of this passport. If you hold a second nationality, apply on that passport instead.',
      steps: ['Contact the nearest Bangladesh mission to confirm your own situation'],
      fee: 'Not applicable',
      time: 'Not applicable'
    }
  };

  // name|ISO2
  const DATA = {
    free: ['Barbados|BB', 'Bhutan|BT', 'Dominica|DM', 'Fiji|FJ', 'Gambia|GM', 'Grenada|GD',
      'Guatemala|GT', 'Hong Kong|HK', 'Jamaica|JM', 'Lesotho|LS', 'Malawi|MW', 'Maldives|MV',
      'Papua New Guinea|PG', 'Saint Kitts and Nevis|KN', 'Saint Lucia|LC',
      'Saint Vincent and the Grenadines|VC', 'Seychelles|SC', 'Sierra Leone|SL',
      'Trinidad and Tobago|TT', 'Zambia|ZM', 'Zimbabwe|ZW'],
    // the published list: US, Canada, Australia, New Zealand, Russia, China, Japan,
    // Singapore, Malaysia, South Korea, the Gulf states, Egypt, Turkey, Brunei and Europe
    voa: ['Albania|AL', 'Andorra|AD', 'Australia|AU', 'Austria|AT', 'Bahrain|BH', 'Belarus|BY',
      'Belgium|BE', 'Bosnia and Herzegovina|BA', 'Brunei|BN', 'Bulgaria|BG',
      'Canada|CA', 'China|CN', 'Croatia|HR', 'Cyprus|CY',
      'Czechia|CZ', 'Denmark|DK', 'Egypt|EG', 'Estonia|EE', 'Finland|FI', 'France|FR', 'Germany|DE',
      'Greece|GR', 'Hungary|HU', 'Iceland|IS', 'Ireland|IE', 'Italy|IT',
      'Japan|JP', 'Kuwait|KW', 'Latvia|LV', 'Liechtenstein|LI', 'Lithuania|LT',
      'Luxembourg|LU', 'Malaysia|MY', 'Malta|MT', 'Moldova|MD', 'Monaco|MC', 'Montenegro|ME',
      'Netherlands|NL', 'New Zealand|NZ', 'North Macedonia|MK', 'Norway|NO', 'Oman|OM',
      'Poland|PL', 'Portugal|PT', 'Qatar|QA', 'Romania|RO',
      'Russia|RU', 'San Marino|SM', 'Saudi Arabia|SA', 'Serbia|RS', 'Singapore|SG',
      'Slovakia|SK', 'Slovenia|SI', 'South Korea|KR', 'Spain|ES', 'Sweden|SE',
      'Switzerland|CH', 'Turkey|TR', 'Ukraine|UA',
      'United Arab Emirates|AE', 'United Kingdom|GB', 'United States|US',
      'Vatican City|VA'],
    mission: ['Algeria|DZ', 'Argentina|AR', 'Brazil|BR', 'Chile|CL', 'Colombia|CO',
      'Indonesia|ID', 'Jordan|JO', 'Mexico|MX', 'Peru|PE', 'Philippines|PH', 'Taiwan|TW',
      'Thailand|TH', 'Uruguay|UY', 'Vietnam|VN', 'Angola|AO', 'Armenia|AM', 'Azerbaijan|AZ',
      'Bahamas|BS', 'Belize|BZ', 'Benin|BJ', 'Bolivia|BO', 'Botswana|BW', 'Burkina Faso|BF',
      'Burundi|BI', 'Cambodia|KH', 'Cameroon|CM', 'Cape Verde|CV', 'Chad|TD', 'Costa Rica|CR',
      'Cuba|CU', 'Democratic Republic of the Congo|CD', 'Dominican Republic|DO', 'Ecuador|EC',
      'Egypt|EG', 'El Salvador|SV', 'Eswatini|SZ', 'Ethiopia|ET', 'Gabon|GA', 'Georgia|GE',
      'Ghana|GH', 'Guinea|GN', 'Guyana|GY', 'Honduras|HN', 'India|IN', 'Ivory Coast|CI',
      'Kazakhstan|KZ', 'Kenya|KE', 'Kyrgyzstan|KG', 'Laos|LA', 'Lebanon|LB', 'Liberia|LR',
      'Madagascar|MG', 'Mali|ML', 'Mauritania|MR', 'Mauritius|MU', 'Mongolia|MN',
      'Morocco|MA', 'Mozambique|MZ', 'Myanmar|MM', 'Namibia|NA', 'Nepal|NP', 'Nicaragua|NI',
      'Niger|NE', 'Panama|PA', 'Paraguay|PY', 'Rwanda|RW', 'Senegal|SN', 'South Africa|ZA',
      'Sri Lanka|LK', 'Suriname|SR', 'Tajikistan|TJ', 'Tanzania|TZ', 'Togo|TG', 'Tunisia|TN',
      'Turkmenistan|TM', 'Uganda|UG', 'Uzbekistan|UZ', 'Venezuela|VE'],
    clearance: ['Afghanistan|AF', 'Iran|IR', 'Iraq|IQ', 'Libya|LY', 'Nigeria|NG',
      'North Korea|KP', 'Pakistan|PK', 'Somalia|SO', 'South Sudan|SS', 'Sudan|SD',
      'Syria|SY', 'Yemen|YE'],
    none: ['Israel|IL']
  };

  // country specific footnotes worth knowing
  const NOTES = {
    IN: 'Indian nationals apply through the Bangladesh High Commission or one of its assistant offices, and a land route via Benapole, Petrapole or Akhaura is normal.',
    NP: 'Direct flights Kathmandu to Dhaka take about an hour. Apply at the Bangladesh Embassy in Kathmandu.',
    LK: 'Apply at the Bangladesh High Commission in Colombo. Direct flights run to Dhaka and Chattogram.',
    GB: 'Large Bangladeshi diaspora links mean the London mission is busy. If you were born in Bangladesh, ask about the No Visa Required stamp instead, which is issued for life.',
    US: 'If you were born in Bangladesh or hold a Bangladeshi parent, the No Visa Required endorsement is usually cheaper and lasts the life of the passport.',
    CA: 'The No Visa Required endorsement applies to people of Bangladeshi origin here too.',
    AU: 'Visa on arrival is issued at Dhaka, Chattogram and Sylhet, never at a land border. Apply online first at voa.specialbranch.gov.bd.',
    EG: 'Egypt is on the published visa on arrival list. Apply online through the Special Branch portal before you fly.',
    CN: 'Business travellers usually need a visa in advance even where tourism is covered by visa on arrival.',
    MM: 'Land crossings from Myanmar are generally closed to tourists. Fly.',
    HK: 'Applies to Hong Kong SAR passport holders. Chinese national passports follow the China rule.',
    TW: 'Apply at the Bangladesh Trade Office if no mission covers your city.',
    IL: 'Bangladeshi passports themselves carry a restriction on travel to Israel, and the position is reciprocal.'
  };

  const COUNTRIES = [];
  Object.keys(DATA).forEach(status => {
    DATA[status].forEach(row => {
      const [name, cc] = row.split('|');
      COUNTRIES.push({ name, cc, status });
    });
  });
  COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));

  const flag = cc => cc.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));

  const input = document.getElementById('visa-input');
  const list = document.getElementById('visa-list');
  const out = document.getElementById('visa-out');
  if (!input || !out) return;

  if (list) {
    list.innerHTML = COUNTRIES.map(c => '<option value="' + c.name + '"></option>').join('');
  }
  const counts = document.querySelectorAll('[data-visa-count]');
  counts.forEach(el => {
    const k = el.getAttribute('data-visa-count');
    el.textContent = k === 'all' ? COUNTRIES.length : DATA[k].length;
  });

  function render(c, scroll) {
    const r = RULES[c.status];
    out.className = 'visa-out tone-' + r.tone;
    out.innerHTML =
      '<div class="visa-head">' +
        '<span class="visa-flag">' + flag(c.cc) + '</span>' +
        '<div>' +
          '<span class="mono">Passport of</span>' +
          '<h3>' + c.name + '</h3>' +
        '</div>' +
        '<span class="visa-badge">' + r.label + '</span>' +
      '</div>' +
      '<p class="visa-what">' + r.what + '</p>' +
      '<div class="facts">' +
        '<div class="fact"><b>' + r.stay.split(',')[0] + '</b><small>Length of stay</small></div>' +
        '<div class="fact"><b style="font-size:19px">' + r.fee + '</b><small>Fee</small></div>' +
        '<div class="fact"><b style="font-size:19px">' + r.time + '</b><small>Processing</small></div>' +
        '<div class="fact"><b style="font-size:19px">' + (c.status === 'voa' ? 'DAC · CGP · ZYL' : 'Any port') + '</b><small>Where it works</small></div>' +
      '</div>' +
      '<h4 class="visa-sub">What you need to do</h4>' +
      '<ol class="visa-steps">' + r.steps.map(s => '<li>' + s + '</li>').join('') + '</ol>' +
      (NOTES[c.cc] ? '<p class="visa-note"><strong>Worth knowing.</strong> ' + NOTES[c.cc] + '</p>' : '') +
      '<p class="visa-note small">Rules change without much notice. Confirm with the Bangladesh mission that covers your country before you book, and check <a href="https://www.visa.gov.bd/" rel="noopener">visa.gov.bd</a> for the current forms.</p>';
    if (scroll) out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function lookup(v) {
    const q = (v || '').trim().toLowerCase();
    if (!q) return null;
    return COUNTRIES.find(c => c.name.toLowerCase() === q) ||
           COUNTRIES.find(c => c.name.toLowerCase().indexOf(q) === 0) ||
           COUNTRIES.find(c => c.name.toLowerCase().indexOf(q) > -1) || null;
  }

  function go(scroll) {
    const c = lookup(input.value);
    if (c) { input.value = c.name; render(c, scroll !== false); }
    else {
      out.className = 'visa-out tone-warn';
      out.innerHTML = '<p class="visa-what">No match for that. Try the country name in English, or pick from the list. ' +
        'If your country is not listed, assume you need a visa in advance and contact the nearest Bangladesh mission.</p>';
    }
  }

  // shareable link: visa.html?c=Ireland
  const pre = new URLSearchParams(location.search).get('c');
  if (pre) { input.value = pre; go(false); }

  input.addEventListener('change', () => go(true));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') go(true); });
  const btn = document.getElementById('visa-go');
  if (btn) btn.addEventListener('click', () => go(true));
  document.querySelectorAll('[data-visa-quick]').forEach(b => {
    b.addEventListener('click', () => {
      input.value = b.getAttribute('data-visa-quick');
      go(true);
    });
  });
})();
