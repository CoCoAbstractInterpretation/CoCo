import os
files = ["bg_header.js", "cs_header.js", "jquery_header.js"]
c = []
for file in files:
	with open(file) as f:
		c.extend(f.readlines())

sink_function = [i.strip() for i in c if "sink_function" in i]
MarkAttackEntry = [i.strip() for i in c if "MarkAttackEntry" in i]
MarkSource = [i.strip() for i in c if "MarkSource" in i]
TriggerEvent = [i.strip() for i in c if "TriggerEvent" in i]

keywords = {"sink_function":sink_function, "MarkAttackEntry":MarkAttackEntry, "MarkSource":MarkSource, "TriggerEvent":TriggerEvent}

for i in keywords:
	print(i)
	keywords[i] = [j for j in keywords[i] if "//" not in j]
	for j in keywords[i]:
		print(j)

# print(sink_function)
# print(MarkAttackEntry)
# print(MarkSource)
# print(TriggerEvent)