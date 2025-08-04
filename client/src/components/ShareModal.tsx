import { Recipe } from '@shared/schema';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Mail, MessageSquare, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShareModalProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareModal({ recipe, open, onOpenChange }: ShareModalProps) {
  const [emailData, setEmailData] = useState({ email: '', message: '' });
  const [smsData, setSmsData] = useState({ phoneNumber: '', message: '' });
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  // Reset form fields when modal opens/closes
  useEffect(() => {
    if (open) {
      // Reset all form fields when modal opens
      setEmailData({ email: '', message: '' });
      setSmsData({ phoneNumber: '', message: '' });
      setCopied(false);
      setIsSharing(false);
    }
  }, [open]);

  const handleEmailShare = async () => {
    if (!emailData.email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      await apiRequest('POST', `/api/recipes/${recipe.id}/share/email`, emailData);
      toast({
        title: "Success",
        description: "Recipe shared via email successfully!",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share recipe via email",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleSmsShare = async () => {
    if (!smsData.phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      await apiRequest('POST', `/api/recipes/${recipe.id}/share/sms`, smsData);
      toast({
        title: "Success",
        description: "Recipe shared via SMS successfully!",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share recipe via SMS",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/recipes/${recipe.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Recipe link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Recipe: {recipe.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>SMS</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center space-x-2">
              <Copy className="w-4 h-4" />
              <span>Link</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={emailData.email}
                onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email-message">Personal Message (Optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Add a personal message..."
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleEmailShare} 
              disabled={isSharing}
              className="w-full"
            >
              {isSharing ? 'Sending...' : 'Send Email'}
            </Button>
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={smsData.phoneNumber}
                onChange={(e) => setSmsData({ ...smsData, phoneNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sms-message">Personal Message (Optional)</Label>
              <Textarea
                id="sms-message"
                placeholder="Add a personal message..."
                value={smsData.message}
                onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleSmsShare} 
              disabled={isSharing}
              className="w-full"
            >
              {isSharing ? 'Sending...' : 'Send SMS'}
            </Button>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div>
              <Label>Recipe Link</Label>
              <div className="flex space-x-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/recipes/${recipe.id}`}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Copy this link to share the recipe anywhere
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
