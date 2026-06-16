const fs = require('fs');
let content = fs.readFileSync('app/dashboard/lab/settings/TestCatalogueRow.tsx', 'utf8');

// Replace department Input with Select
content = content.replace(
  /<Label className="text-xs font-medium text-slate-700">Department<\/Label>\s*<Input[\s\S]*?className="h-9 bg-slate-50"\s*\/>/g,
  `<Label className="text-xs font-medium text-slate-700">Department</Label>
                                        <Select
                                            value={payload.department || ""}
                                            onValueChange={(val) => setPayload(prev => ({ ...prev, department: val }))}
                                        >
                                            <SelectTrigger className="h-9 bg-slate-50 w-full">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HEAMATOLOGY">HEAMATOLOGY</SelectItem>
                                                <SelectItem value="BIOCHEMISTRY">BIOCHEMISTRY</SelectItem>
                                                <SelectItem value="SEROLOGY">SEROLOGY</SelectItem>
                                                <SelectItem value="IMMUNOLOGY">IMMUNOLOGY</SelectItem>
                                                <SelectItem value="CLINICAL PATHOLOGY">CLINICAL PATHOLOGY</SelectItem>
                                            </SelectContent>
                                        </Select>`
);

// Remove root upto from payload types
content = content.replace(/upto\?: number;/g, '');
content = content.replace(/upto: test\.upto,/g, '');

// Handle range change for upto, min, max
const handleRangeRegex = /const handleRangeChange = \(index: number, field: string, value: any\) => \{\s*setPayload\(\(prev\) => \{\s*const updatedRange = \[\.\.\.\(prev\.range \|\| \[\]\)\];\s*updatedRange\[index\] = \{ \.\.\.updatedRange\[index\], \[field\]: value \};\s*return \{ \.\.\.prev, range: updatedRange \};\s*\}\);\s*\};/g;

content = content.replace(handleRangeRegex, `const handleRangeChange = (index: number, field: string, value: any) => {
        setPayload((prev) => {
            const updatedRange = [...(prev.range || [])];
            let newRangeItem = { ...updatedRange[index], [field]: value };
            
            if (field === 'upto' && value !== undefined && value !== null && value !== "") {
                newRangeItem.min = undefined;
                newRangeItem.max = undefined;
            }
            
            if ((field === 'min' || field === 'max') && value !== undefined && value !== null && value !== "") {
                newRangeItem.upto = undefined;
            }
            
            updatedRange[index] = newRangeItem;
            return { ...prev, range: updatedRange };
        });
    };`);

// Add upto to addRange
content = content.replace(/\{ name: "", min: undefined, max: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year" \}/g, '{ name: "", min: undefined, max: undefined, upto: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year" }');

// Update view mode range display
content = content.replace(/<strong>\{r\.name \|\| "Default"\}:<\/strong> \{r\.min \?\? "-"\} to \{r\.max \?\? "-"\}/g, `<strong>{r.name || "Default"}:</strong> {r.upto !== undefined && r.upto !== null ? \`Upto \${r.upto}\` : \`\${r.min ?? "-"} to \${r.max ?? "-"}\`}`);

content = content.replace(/\{r\.min \?\? "Any"\} min - \{r\.max \?\? "Any"\} max/g, `{r.upto !== undefined && r.upto !== null ? \`Upto \${r.upto}\` : \`\${r.min ?? "Any"} min - \${r.max ?? "Any"} max\`}`);

// Remove root upto UI from edit modal
content = content.replace(/<div className="col-span-2 space-y-1\.5">\s*<Label className="text-xs font-medium text-slate-700">Upto \(Max Value\)<\/Label>\s*<Input\s*type="number"\s*placeholder="e\.g\. 40"\s*value=\{payload\.upto \?\? ""\}\s*onChange=\{\(e\) =>\s*setPayload\(\(prev\) => \(\{ \.\.\.prev, upto: e\.target\.value \? Number\(e\.target\.value\) : undefined \}\)\)\s*\}\s*className="h-9 bg-slate-50"\s*\/>\s*<\/div>/g, '');

// Remove root upto UI from view modal
content = content.replace(/<div className="space-y-1">\s*<Label className="text-slate-500">Upto \(Max Value\)<\/Label>\s*<p className="font-medium text-sm">\{test\.upto \?\? "N\/A"\}<\/p>\s*<\/div>/g, '');

// Add upto column to range table
content = content.replace(/<TableHead className="w-20">Min<\/TableHead>\s*<TableHead className="w-20">Max<\/TableHead>/g, '<TableHead className="w-20">Min</TableHead>\n<TableHead className="w-20">Max</TableHead>\n<TableHead className="w-24">UpTo</TableHead>');

content = content.replace(/<TableCell>\s*<Input\s*type="number"\s*placeholder="Max"\s*value=\{r\.max \?\? ""\}\s*onChange=\{\(e\) => handleRangeChange\(i, "max", e\.target\.value \? Number\(e\.target\.value\) : undefined\)\}\s*className="h-8 shadow-none bg-slate-50 px-2"\s*\/>\s*<\/TableCell>/g, `<TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder="Max"
                                                                value={r.max ?? ""}
                                                                onChange={(e) => handleRangeChange(i, "max", e.target.value ? Number(e.target.value) : undefined)}
                                                                className="h-8 shadow-none bg-slate-50 px-2"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder="UpTo"
                                                                value={r.upto ?? ""}
                                                                onChange={(e) => handleRangeChange(i, "upto", e.target.value ? Number(e.target.value) : undefined)}
                                                                className="h-8 shadow-none bg-slate-50 px-2"
                                                            />
                                                        </TableCell>`);


fs.writeFileSync('app/dashboard/lab/settings/TestCatalogueRow.tsx', content);
