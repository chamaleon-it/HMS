import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Test {
    _id: string;
    code: string;
    name: string;
    panels: {
        name: string
    }[];
}

interface RemoveTestsFromPanelDialogProps {
    panelName: string;
    allTests: Test[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function RemoveTestsFromPanelDialog({
    panelName,
    allTests,
    open,
    onOpenChange,
    onSuccess,
}: RemoveTestsFromPanelDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Initialize selectedTestIds to empty when opening
    useEffect(() => {
        if (open) {
            setSelectedTestIds([]);
            setSearchQuery("");
        }
    }, [open]);

    // Only show tests that are IN this panel
    const panelTests = useMemo(() => {
        return allTests.filter((test) => test.panels?.some(panel => panel.name === panelName));
    }, [allTests, panelName]);

    const filteredTests = useMemo(() => {
        if (!searchQuery) return panelTests;
        const lowerQuery = searchQuery.toLowerCase();
        return panelTests.filter(
            (test) =>
                test.name.toLowerCase().includes(lowerQuery) ||
                test.code.toLowerCase().includes(lowerQuery)
        );
    }, [panelTests, searchQuery]);

    const handleToggleTest = (testId: string) => {
        const newSelected = [...selectedTestIds];
        if (newSelected.includes(testId)) {
            newSelected.splice(newSelected.indexOf(testId), 1);
        } else {
            newSelected.push(testId);
        }
        setSelectedTestIds(newSelected);
    };

    const handleRemove = async () => {
        setLoading(true);
        try {
            const payload: {
                panelName: string,
                tests: string[]
            } = {
                panelName,
                tests: selectedTestIds
            }

            await toast.promise(api.post('/lab/panels/remove_test', payload), {
                loading: 'Removing tests from panel...',
                success: 'Tests removed from panel successfully',
                error: 'Failed to remove tests from panel'
            })

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Remove Tests from {panelName}</DialogTitle>
                    <DialogDescription>
                        Select tests to remove from this panel.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                    <Input
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex-1 border rounded-md p-2 max-h-72 overflow-y-scroll">
                        <div className="space-y-4">
                            {filteredTests.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    {panelTests.length === 0 ? "No tests in this panel." : "No matching tests found."}
                                </p>
                            ) : (
                                filteredTests?.map((test) => (
                                    <div
                                        key={test._id}
                                        className="flex items-center space-x-2 border-b last:border-0 pb-2 last:pb-0"
                                    >
                                        <Checkbox
                                            id={`remove-${test._id}`}
                                            checked={selectedTestIds.includes(test._id)}
                                            onCheckedChange={() => handleToggleTest(test._id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={`remove-${test._id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {test.name}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {test.code}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleRemove} disabled={loading || selectedTestIds.length === 0}>
                        {loading ? "Removing..." : "Remove Selected"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
