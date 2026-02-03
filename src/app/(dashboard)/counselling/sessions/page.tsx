"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import counsellingService, {
  CounsellingSession,
} from "@/services/counselling.service";
import {
  Calendar,
  Clock,
  Video,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Star,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CounsellingSessionsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [reviewCounsellorId, setReviewCounsellorId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Theme observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setDarkMode(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await counsellingService.getMySessions();
      // Sort by scheduledDate or preferredDate
      setSessions(
        data.sort((a, b) => {
           const dateA = new Date(a.scheduledDate || a.preferredDate).getTime();
           const dateB = new Date(b.scheduledDate || b.preferredDate).getTime();
           return dateB - dateA;
        })
      );
    } catch (err: any) {
      console.error("Failed to fetch sessions:", err);
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    try {
      setCancelling(sessionId);
      await counsellingService.cancelSession(sessionId, reason);
      await fetchSessions();
    } catch (err: any) {
      console.error("Failed to cancel session:", err);
      alert(err.message || "Failed to cancel session");
    } finally {
      setCancelling(null);
    }
  };

  const openReviewModal = (sessionId: string, counsellorId: string) => {
    setReviewSessionId(sessionId);
    setReviewCounsellorId(counsellorId);
    setRating(0);
    setReviewText("");
    setIsReviewOpen(true);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSessionId || !reviewCounsellorId) return;

    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    try {
      setSubmittingReview(true);
      await counsellingService.submitReview({
        sessionId: reviewSessionId,
        counsellorId: reviewCounsellorId,
        rating,
        review: reviewText,
      });
      alert("Review submitted successfully!");
      setIsReviewOpen(false);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Confirmed</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "pending_assignment":
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Pending</Badge>;
    }
  };

  // Safe access for counsellor details
  const getCounsellorName = (session: CounsellingSession) => {
    if (session.counsellor) return session.counsellor.name;
    if (session.counsellorId && typeof session.counsellorId === 'object') {
      return (session.counsellorId as any).name;
    }
    return "Pending Assignment";
  };
  
  const getCounsellorId = (session: CounsellingSession): string | null => {
      if (session.counsellor) return session.counsellor._id;
      if (session.counsellorId && typeof session.counsellorId === 'object') {
          return (session.counsellorId as any)._id;
      }
      if (typeof session.counsellorId === 'string') return session.counsellorId;
      return null;
  };

  const filteredSessions = sessions.filter(session => {
     const isPast = ["completed", "cancelled", "no-show"].includes(session.status);
     const isUpcoming = ["pending_assignment", "scheduled", "confirmed"].includes(session.status);
     
     if (selectedTab === "past") return isPast;
     return isUpcoming;
  });

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#071219]" : "bg-gray-50"}`}>
        {/* Navbar */}
      <header
        className="sticky top-0 z-50 w-full border-b backdrop-blur-xl"
        style={{
          backgroundColor: darkMode
            ? "rgba(10, 15, 20, 0.58)"
            : "rgba(255, 255, 255, 0.55)",
          borderColor: darkMode
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/dashboard"
              className={`font-bold text-lg sm:text-xl ${darkMode ? "text-white" : "text-[#2596be]"}`}
            >
              Test Portal
            </Link>
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
              <Link
                href="/dashboard"
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/tests"
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
              >
                Tests
              </Link>
              <Link
                href="/analytics"
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
              >
                Analytics
              </Link>
              <Link
                href="/history"
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
              >
                History
              </Link>
              <Link
                href="/counselling/enrollments"
                className={`font-medium transition-colors ${darkMode ? "text-white" : "text-[#2596be]"}`}
              >
                Counselling
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle("dark");
                localStorage.setItem(
                  "theme",
                  html.classList.contains("dark") ? "dark" : "light"
                );
              }}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <Link
              href="/profile"
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={logout}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-5xl space-y-6 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>My Sessions</h1>
            <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Track and manage your upcoming counselling sessions</p>
          </div>
          <Button onClick={() => router.push("/counselling/book-session")}>
            Book New Session
          </Button>
        </div>

        <div className={`flex gap-2 border-b pb-1 ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
           <button 
             onClick={() => setSelectedTab("upcoming")}
             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${selectedTab === 'upcoming' ? 'border-[#2596be] text-[#2596be]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
           >
              Upcoming
           </button>
           <button 
             onClick={() => setSelectedTab("past")}
             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${selectedTab === 'past' ? 'border-[#2596be] text-[#2596be]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
           >
              Past Sessions
           </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
             {error}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className={`text-center py-12 rounded-lg border border-dashed ${darkMode ? "bg-white/5 border-white/10" : "bg-muted/30 border-gray-200"}`}>
             <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
             <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>No {selectedTab} sessions found</h3>
             <p className={`text-sm max-w-sm mx-auto mt-1 ${darkMode ? "text-gray-400" : "text-muted-foreground"}`}>
               {selectedTab === 'upcoming' 
                 ? "You don't have any sessions scheduled properly. Book a session to get started." 
                 : "You haven't completed any sessions yet."}
             </p>
             {selectedTab === 'upcoming' && (
               <Button variant="outline" className="mt-4" onClick={() => router.push("/counselling/book-session")}>
                 Book Now
               </Button>
             )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSessions.map((session) => (
              <Card key={session._id} className={`overflow-hidden ${darkMode ? "bg-white/5 border-white/10" : ""}`}>
                 <CardHeader className={`pb-3 ${darkMode ? "bg-white/5" : "bg-muted/20"}`}>
                   <div className="flex justify-between items-start">
                      <div>
                         <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                             {session.status === 'confirmed' ? <Video className="w-4 h-4 text-[#2596be]" /> : <Clock className="w-4 h-4 text-[#2596be]" />}
                             {session.agenda || "Counselling Session"}
                         </CardTitle>
                         <CardDescription className={`mt-1 flex items-center gap-2 text-xs sm:text-sm ${darkMode ? "text-gray-400" : ""}`}>
                            <span className={`font-medium ${darkMode ? "text-gray-300" : "text-foreground"}`}>{new Date(session.scheduledDate || session.preferredDate).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{session.preferredTimeSlot}</span>
                         </CardDescription>
                      </div>
                      {getStatusBadge(session.status)}
                   </div>
                 </CardHeader>
                 <CardContent className="pt-4 grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Counsellor</p>
                       <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className={`font-medium ${darkMode ? "text-gray-200" : ""}`}>{getCounsellorName(session)}</span>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</p>
                       <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <span className={`capitalize ${darkMode ? "text-gray-200" : ""}`}>{session.meetingPreference === 'google_meet' ? 'Google Meet' : session.meetingPreference}</span>
                       </div>
                    </div>
                 </CardContent>
                 <CardFooter className={`flex justify-end gap-3 pt-3 pb-3 ${darkMode ? "bg-white/5" : "bg-muted/10"}`}>
                    {session.status === 'pending_assignment' && (
                       <p className="text-xs text-muted-foreground self-center mr-auto">Waiting for counsellor assignment...</p>
                    )}
                    
                    {session.meetingLink && session.status === 'confirmed' && (
                       <Button size="sm" className="gap-2 bg-[#2596be] hover:bg-[#1e7ca0] text-white" asChild>
                          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                             <Video className="w-4 h-4" /> Join Meeting
                          </a>
                       </Button>
                    )}
                    
                    {session.status === 'completed' && !session.cancellationReason && (
                       <Button size="sm" variant="outline" className="gap-2" onClick={() => {
                          const cId = getCounsellorId(session);
                          if (cId) openReviewModal(session._id, cId);
                       }}>
                          <Star className="w-4 h-4" /> Rate Session
                       </Button>
                    )}

                    {(session.status === 'scheduled' || session.status === 'pending_assignment') && (
                       <Button 
                         size="sm" 
                         variant="destructive" 
                         onClick={() => handleCancelSession(session._id)}
                         disabled={!!cancelling}
                        >
                         Cancel
                       </Button>
                    )}
                 </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Simple Review Modal Overlay */}
        {isReviewOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className={`rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${darkMode ? "bg-[#071219] border border-white/10" : "bg-background"}`}>
                 <div className={`p-6 border-b ${darkMode ? "border-white/10" : ""}`}>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : ""}`}>Rate your session</h3>
                    <p className="text-sm text-muted-foreground">How was your experience with the counsellor?</p>
                 </div>
                 <div className="p-6 space-y-4">
                    <div className="flex justify-center gap-2 py-2">
                       {[1, 2, 3, 4, 5].map((star) => (
                          <button
                             key={star}
                             type="button"
                             onClick={() => setRating(star)}
                             className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-muted'}`}
                          >
                             <Star className={`w-8 h-8 ${rating >= star ? 'fill-yellow-400' : 'fill-none stroke-gray-300'}`} />
                          </button>
                       ))}
                    </div>
                    <textarea
                       className={`w-full min-h-[100px] p-3 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2596be] ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : ""}`}
                       placeholder="Share your feedback..."
                       value={reviewText}
                       onChange={(e) => setReviewText(e.target.value)}
                    />
                 </div>
                 <div className={`p-6 border-t flex justify-end gap-2 ${darkMode ? "bg-white/5 border-white/10" : "bg-muted/20"}`}>
                    <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
                    <Button onClick={submitReview} disabled={submittingReview || rating === 0} className="bg-[#2596be] hover:bg-[#1e7ca0] text-white">
                       {submittingReview && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Submit Review
                    </Button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
