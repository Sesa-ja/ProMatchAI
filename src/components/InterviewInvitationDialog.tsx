import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface InterviewInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName?: string;
  opportunityTitle?: string;
  companyName?: string;
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function InterviewInvitationDialog({
  open,
  onOpenChange,
  candidateName,
  opportunityTitle,
  companyName,
  note,
  onNoteChange,
  onSubmit,
  onCancel,
}: InterviewInvitationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Invite to Interview</DialogTitle>
          <DialogDescription>
            Send an interview invitation note for {candidateName || 'this candidate'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <div>Opportunity: {opportunityTitle || 'Opportunity'}</div>
            <div>Company: {companyName || 'Company'}</div>
          </div>
          <div>
            <label className="block text-sm mb-2">Invitation Note</label>
            <Textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={5}
              placeholder="Write the interview invitation note..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!note.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
