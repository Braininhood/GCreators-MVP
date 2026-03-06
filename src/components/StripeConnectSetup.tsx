import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  CreditCard,
  DollarSign,
  Clock
} from "lucide-react";

interface StripeConnectSetupProps {
  mentorId: string;
}

interface ConnectStatus {
  exists: boolean;
  accountId?: string;
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements?: any;
  payoutSchedule?: any;
}

const CONNECT_UNAVAILABLE_KEY = "gcreators_connect_unavailable";

export const StripeConnectSetup = ({ mentorId }: StripeConnectSetupProps) => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [platformConnectUnavailable, setPlatformConnectUnavailable] = useState(() =>
    typeof sessionStorage !== "undefined" ? sessionStorage.getItem(CONNECT_UNAVAILABLE_KEY) === "1" : false
  );
  const { toast } = useToast();

  useEffect(() => {
    checkConnectStatus();
  }, [mentorId]);

  // Refetch when returning from Stripe onboarding; show clear success or info message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setupComplete = params.get("setup") === "complete";
    const isRefresh = params.get("refresh") === "true";
    if (!setupComplete && !isRefresh) return;

    let cancelled = false;
    (async () => {
      const data = await checkConnectStatus();
      if (cancelled) return;

      if (setupComplete) {
        if (data?.onboardingCompleted && data?.chargesEnabled && data?.payoutsEnabled) {
          toast({
            title: "All set!",
            description: "Payout setup is complete. You can receive payments from bookings and product sales.",
            variant: "default",
          });
        } else {
          toast({
            title: "Almost there",
            description: "We're verifying your details. If you just finished the form, status may update in a moment.",
            variant: "default",
          });
        }
      } else if (isRefresh) {
        toast({
          title: "Back on dashboard",
          description: "You can continue payout setup whenever you're ready.",
          variant: "default",
        });
      }

      params.delete("setup");
      params.delete("refresh");
      const qs = params.toString();
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const checkConnectStatus = async (): Promise<ConnectStatus | null> => {
    setLoading(true);
    try {
      // Same auth flow as create-booking (refresh then pass token immediately)
      const { data: { session }, error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr || !session?.access_token) {
        toast({
          title: "Session expired",
          description: "Please sign in again to view payout setup.",
          variant: "destructive",
        });
        setLoading(false);
        return null;
      }

      const { data, error } = await supabase.functions.invoke("stripe-connect-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        const status = (error as { context?: Response })?.context?.status;
        if (status === 401) {
          toast({
            title: "Session expired",
            description: "Please sign in again to view payout setup.",
            variant: "destructive",
          });
          setLoading(false);
          return null;
        }
        throw error;
      }

      // Stale Stripe account was auto-cleared — treat as fresh start
      if (data?._cleared) {
        setStatus({ exists: false, onboardingCompleted: false, chargesEnabled: false, payoutsEnabled: false });
        toast({ title: "Stripe account reset", description: "Your previous Stripe account was no longer valid. Please set up a new one." });
        return null;
      }
      setStatus(data);
      return data ?? null;
    } catch (error: any) {
      if (error?.message?.includes("sign in again")) {
        toast({
          title: "Session expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        setLoading(false);
        return null;
      }
      console.error("[STRIPE-CONNECT-SETUP] Error checking status:", error);
      setStatus({ exists: false, onboardingCompleted: false, chargesEnabled: false, payoutsEnabled: false });
      toast({
        title: "Error",
        description: error?.message || "Failed to check payout setup status. You can still try setting up.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = async (): Promise<{ Authorization: string }> => {
    const { data: { session }, error: refreshErr } = await supabase.auth.refreshSession();
    if (refreshErr || !session?.access_token) {
      throw new Error("Please sign in again to continue.");
    }
    return { Authorization: `Bearer ${session.access_token}` };
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      const headers = await getAuthHeaders();

      // Step 1: Create Stripe Connect account
      const { data: accountData, error: accountError } = await supabase.functions.invoke(
        "create-stripe-connect-account",
        { headers }
      );


      if (accountError) {
        const ctx = (accountError as { context?: { status?: number; json?: () => Promise<{ error?: string; details?: string }> } }).context;
        let msg = accountError.message;
        if (typeof ctx?.json === "function") {
          try {
            const body = await ctx.json();
            if (body?.error) msg = body.details ? `${body.error}: ${body.details}` : body.error;
          } catch {
            // ignore
          }
        }
        throw new Error(msg);
      }

      console.log("[STRIPE-CONNECT-SETUP] Account created:", accountData);

      // Step 2: Get onboarding link
      const { data: onboardingData, error: onboardingError } = await supabase.functions.invoke(
        "stripe-connect-onboarding",
        { headers }
      );

      if (onboardingError) {
        const ctx = (onboardingError as { context?: { status?: number; json?: () => Promise<{ error?: string; details?: string; _cleared?: boolean }> } }).context;
        let msg = onboardingError.message;
        let cleared = false;
        if (typeof ctx?.json === "function") {
          try {
            const body = await ctx.json();
            if (body?._cleared) cleared = true;
            if (body?.error) msg = body.details ? `${body.error}: ${body.details}` : body.error;
          } catch {
            // ignore
          }
        }
        if (cleared) {
          setCreating(false);
          setStatus({ exists: false, onboardingCompleted: false, chargesEnabled: false, payoutsEnabled: false });
          toast({ title: "Stripe account reset", description: "Please click 'Set Up Payouts' to create a new account." });
          await checkConnectStatus();
          return;
        }
        throw new Error(msg);
      }

      // Redirect to Stripe onboarding
      if (onboardingData?.url) {
        window.location.href = onboardingData.url;
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (error: any) {
      console.error("[STRIPE-CONNECT-SETUP] Error:", error);
      const msg = error?.message ?? "Failed to start payout setup";
      const isConnectNotEnabled = typeof msg === "string" && (msg.includes("signed up for Connect") || msg.includes("connect"));
      if (isConnectNotEnabled) {
        setPlatformConnectUnavailable(true);
        try {
          sessionStorage.setItem(CONNECT_UNAVAILABLE_KEY, "1");
        } catch {
          // ignore
        }
      }
      toast({
        title: "Setup Failed",
        description: isConnectNotEnabled
          ? "Payouts are not yet available: the platform must enable Stripe Connect first. Contact support or try again later."
          : msg,
        variant: "destructive",
      });
      setCreating(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setCreating(true);
    try {
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboarding", {
        headers,
      });

      if (error) {
        const ctx = (error as { context?: { json?: () => Promise<{ error?: string; details?: string }> } }).context;
        let msg = error.message;
        if (typeof ctx?.json === "function") {
          try {
            const body = await ctx.json();
            if (body?.error) msg = body.details ? `${body.error}: ${body.details}` : body.error;
          } catch {
            // ignore
          }
        }
        throw new Error(msg);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (error: any) {
      console.error("[STRIPE-CONNECT-SETUP] Error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to continue onboarding",
        variant: "destructive",
      });
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Account fully set up
  if (status?.onboardingCompleted && status?.chargesEnabled && status?.payoutsEnabled) {
    return (
      <Card className="border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Payouts Enabled</CardTitle>
                <CardDescription>Your account is ready to receive payments</CardDescription>
              </div>
            </div>
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Charges Enabled</p>
                <p className="text-xs text-muted-foreground">Can accept payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Payouts Enabled</p>
                <p className="text-xs text-muted-foreground">Can receive transfers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Schedule</p>
                <p className="text-xs text-muted-foreground">
                  {status?.payoutSchedule?.interval || "Weekly"}
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Your earnings will be automatically transferred to your bank account according to your payout schedule.
              Platform fee (15%) and Stripe fees (2.9% + $0.30) are deducted automatically. Your bank account was verified by Stripe when you set up payouts.
            </AlertDescription>
          </Alert>

          <div className="pt-2 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-1">Changing your bank account</p>
            <p className="text-sm text-muted-foreground">
              For security, bank details can only be updated with the help of support. This reduces the risk of payout errors and fraud. To request a change, contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Account exists but onboarding incomplete
  if (status?.exists && !status?.onboardingCompleted) {
    return (
      <Card className="border-yellow-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Complete Payout Setup</CardTitle>
              <CardDescription>Finish connecting your bank account to receive payments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your payout account is incomplete. Complete the setup to start receiving earnings from bookings and product sales.
            </AlertDescription>
          </Alert>

          {status?.requirements && status.requirements.currently_due?.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Required Information:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {status.requirements.currently_due.map((req: string) => (
                  <li key={req}>• {req.replace(/_/g, " ")}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleContinueOnboarding}
            disabled={creating}
            size="lg"
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Opening Stripe...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-5 w-5" />
                Continue Setup
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Platform hasn't enabled Connect yet – show clear message so user doesn't keep clicking
  if (platformConnectUnavailable) {
    return (
      <Card className="border-amber-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Payout Setup Not Available Yet</CardTitle>
              <CardDescription>Connect must be enabled on the platform before you can add your bank account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="bg-amber-500/10 border-amber-500/30">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              Payout setup is temporarily unavailable. The platform needs to enable Stripe Connect first. Once that’s done, you’ll be able to connect your bank account here. Contact support if you need help or try again later.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPlatformConnectUnavailable(false);
                try {
                  sessionStorage.removeItem(CONNECT_UNAVAILABLE_KEY);
                } catch {
                  // ignore
                }
                checkConnectStatus();
              }}
            >
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No account exists - initial setup
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Set Up Payouts</CardTitle>
            <CardDescription>Connect your bank account to receive earnings</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            To receive payments from bookings and product sales, you need to connect your bank account through Stripe.
            Stripe will collect and verify your bank details; this one-time setup takes about 5 minutes. For security, bank account changes after setup can only be made with support.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-primary/10 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Secure Setup</p>
              <p className="text-sm text-muted-foreground">
                Powered by Stripe, the industry standard for secure payments
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-primary/10 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Automatic Transfers</p>
              <p className="text-sm text-muted-foreground">
                Earnings are transferred to your bank account automatically
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-primary/10 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Transparent Fees</p>
              <p className="text-sm text-muted-foreground">
                15% platform fee + Stripe fees (2.9% + $0.30 per transaction)
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreateAccount}
          disabled={creating}
          size="lg"
          className="w-full"
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-5 w-5" />
              Set Up Payouts with Stripe
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You'll be redirected to Stripe to securely connect your bank account
        </p>
      </CardContent>
    </Card>
  );
};
