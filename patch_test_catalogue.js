const fs = require('fs');
let content = fs.readFileSync('app/dashboard/lab/settings/TestCatalogue.tsx', 'utf8');

// Replace department Input with Select
content = content.replace(
  /<Label className="text-sm font-medium text-slate-700">Department<\/Label>\s*<Input\s*placeholder="e\.g\. Pathology"\s*value=\{newTest\.department \|\| ""\}\s*onChange=\{\(e\) =>\s*setNewTest\(\(prev\) => \(\{ \.\.\.prev, department: e\.target\.value \}\)\)\s*\}\s*className="h-9 bg-slate-50"\s*\/>/g,
  `<Label className="text-sm font-medium text-slate-700">Department</Label>
                    <Select
                      value={newTest.department || ""}
                      onValueChange={(val) => setNewTest(prev => ({ ...prev, department: val }))}
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
content = content.replace(/upto: undefined,/g, '');

// Add upto to addRange
content = content.replace(/\{ name: "", min: undefined, max: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year" \}/g, '{ name: "", min: undefined, max: undefined, upto: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year" }');

// Remove root upto UI from edit modal
content = content.replace(/<div className="space-y-1\.5">\s*<Label className="text-sm font-medium text-slate-700">Upto \(Max Value\)<\/Label>\s*<Input\s*type="number"\s*placeholder="e\.g\. 40"\s*value=\{newTest\.upto \?\? ""\}\s*onChange=\{\(e\) =>\s*setNewTest\(\(prev\) => \(\{ \.\.\.prev, upto: e\.target\.value \? Number\(e\.target\.value\) : undefined \}\)\)\s*\}\s*className="h-9 bg-slate-50"\s*\/>\s*<\/div>/g, '');

const handleRangeRegex = /const handleRangeChange = \(index: number, field: string, value: any\) => \{\s*setNewTest\(\(prev\) => \{\s*const updatedRange = \[\.\.\.\(prev\.range \|\| \[\]\)\];\s*updatedRange\[index\] = \{ \.\.\.updatedRange\[index\], \[field\]: value \};\s*return \{ \.\.\.prev, range: updatedRange \};\s*\}\);\s*\};/g;

content = content.replace(handleRangeRegex, `const handleRangeChange = (index: number, field: string, value: any) => {
    setNewTest((prev) => {
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

fs.writeFileSync('app/dashboard/lab/settings/TestCatalogue.tsx', content);
