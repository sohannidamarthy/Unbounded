path = 'frontend/app/dashboard/page.tsx'
content = open(path).read()
old = '${leg.outcome_key} (${decimalToAmerican'
new = '${formatTeamName(leg.outcome_key)} (${decimalToAmerican'
content = content.replace(old, new)
open(path, 'w').write(content)
print('done')
