import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Mail, X, CheckCircle } from 'lucide-react';

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const sendVerificationMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/send-verification'),
    onSuccess: () => {
      toast({
        title: "Verification email sent!",
        description: "Check your inbox and click the verification link.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to send verification email";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Don't show banner if loading, user is verified, or banner was dismissed
  if (isLoading || !user || user.emailVerified || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Verify your email address</strong> to enable recipe sharing and get important updates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendVerificationMutation.mutate()}
            disabled={sendVerificationMutation.isPending}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-800/20"
          >
            {sendVerificationMutation.isPending ? "Sending..." : "Send Verification Email"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}