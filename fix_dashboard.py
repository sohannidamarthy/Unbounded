path = 'frontend/app/dashboard/page.tsx'
content = open(path).read()
old = 'function formatStartTime'
new = 'function formatTeamName(name: string): string {\n  return name\n    .split("_")\n    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))\n    .join(" ");\n}\n\nfunction formatStartTime'
content = content.replace(old, new)
open(path, 'w').write(content)
print('done')
