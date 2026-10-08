import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, MapPin, PlusCircle, Search, Sparkles, AlertCircle, Flame, Camera, Upload, Clock, Send } from 'lucide-react';
import { fetchComplaints, upvoteComplaintApi, createComplaintApi, addCommentApi } from '../services/api';
import { uploadPhotoToFirebase } from '../services/storageService';
import { Complaint, Comment } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

export default function SocialFeedPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Post modal & photo upload state
  const [showPostModal, setShowPostModal] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newWard, setNewWard] = useState('WARD-12');
  const [newRoadType, setNewRoadType] = useState('Collector');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active expanded comments state
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ [id: string]: string }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchComplaints({ wardId: wardFilter, search });
      setComplaints(data);
    } catch (err: any) {
      console.error('Failed to load social feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [wardFilter, search]);

  const handleUpvote = async (complaintId: string) => {
    if (upvotedIds.has(complaintId)) return;
    try {
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id === complaintId) {
            const newUpvotes = (c.upvoteCount || 0) + 1;
            const wo = c.workOrder
              ? {
                  ...c.workOrder,
                  priorityScore: Math.min(100, c.workOrder.priorityScore + 2),
                }
              : undefined;
            return { ...c, upvoteCount: newUpvotes, workOrder: wo };
          }
          return c;
        })
      );
      setUpvotedIds((prev) => new Set(prev).add(complaintId));

      await upvoteComplaintApi(complaintId);
    } catch (err: any) {
      alert('Failed to register upvote');
      loadData();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const tempId = `POST_${Date.now()}`;
      const url = await uploadPhotoToFirebase(file, 'complaints', tempId);
      setPhotoUrl(url);
    } catch (err: any) {
      alert('Failed to upload image photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    try {
      setIsSubmitting(true);
      await createComplaintApi({
        description: newDesc,
        roadType: newRoadType,
        wardId: newWard,
        latitude: newWard === 'WARD-12' ? 12.9732 : newWard === 'WARD-18' ? 12.9862 : 12.9552,
        longitude: newWard === 'WARD-12' ? 77.5942 : newWard === 'WARD-18' ? 77.6142 : 77.5802,
        photoUrl: photoUrl || undefined,
      });
      setNewDesc('');
      setPhotoUrl('');
      setShowPostModal(false);
      await loadData();
      alert('Your road issue was posted to the community feed and queued for municipal priority scoring!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (complaintId: string) => {
    const text = commentInput[complaintId];
    if (!text || !text.trim()) return;

    try {
      setIsSubmittingComment(true);
      await addCommentApi(complaintId, text, 'Citizen');
      setCommentInput((prev) => ({ ...prev, [complaintId]: '' }));
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatPostTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="MFO Logo" className="h-11 w-11 object-contain shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">CIVIC ROAD FEED & UPVOTES</h1>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                COMMUNITY DEMOCRACY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Report local road problems with photo evidence, upvote neighbor complaints, and escalate municipal repair priorities
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="uiverse-slide-btn shrink-0 shadow-md"
        >
          <span>REPORT ROAD ISSUE</span>
        </button>
      </div>

      {/* Community Impact Banner */}
      <div className="cookie-card bg-slate-900 text-white border border-slate-800 shadow-xl p-4 space-y-2">
        <div className="title text-amber-400 font-bold text-sm flex items-center">
          <Flame className="h-4 w-4 mr-1.5" />
          HOW CITIZEN UPVOTES WORK
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Every upvote from a verified citizen adds <b>+2 points</b> to a complaint's priority score in the municipal command engine (up to +20 points max). Issues with high community votes rise to the top of daily repair schedules!
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search road issues..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Zone:</span>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700"
          >
            <option value="ALL">All Municipal Wards</option>
            <option value="WARD-12">Ward 12 (North)</option>
            <option value="WARD-18">Ward 18 (East)</option>
            <option value="WARD-24">Ward 24 (South)</option>
          </select>
        </div>
      </div>

      {/* Feed Posts List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-bold">No road complaints match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {complaints.map((item) => {
            const hasUpvoted = upvotedIds.has(item.id);
            const commentsCount = item.comments?.length || 0;
            const isCommentsExpanded = expandedCommentsId === item.id;

            return (
              <div key={item.id} className="cookie-card space-y-3">
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {item.ticketNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatPostTimestamp(item.reportedAt)}
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-slate-500 mt-1 font-semibold">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-blue-500 shrink-0" />
                        <span>{item.ward?.name.split('-')[0]}</span>
                        <span className="mx-1">•</span>
                        <span className="text-slate-400">{item.roadType} Road</span>
                      </div>
                    </div>

                    {item.workOrder && (
                      <PriorityBadge band={item.workOrder.priorityBand} size="sm" />
                    )}
                  </div>

                  {/* Description */}
                  <h3 className="title text-base mt-3 leading-snug">
                    {item.description}
                  </h3>

                  {/* Photo Attachment */}
                  {item.photoUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 h-64 bg-slate-100 max-w-xl">
                      <img src={item.photoUrl} alt="Road Issue" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="actions pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpvote(item.id)}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        hasUpvoted
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
                      <span>{hasUpvoted ? 'UPVOTED' : 'UPVOTE'}</span>
                      <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
                        {item.upvoteCount || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => setExpandedCommentsId(isCommentsExpanded ? null : item.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                      <span>COMMENTS ({commentsCount})</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono font-bold">
                    {item.workOrder && (
                      <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                        Priority Score: {item.workOrder.priorityScore}
                      </span>
                    )}
                    <span className="capitalize px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Interactive Comments Section */}
                {isCommentsExpanded && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {item.comments && item.comments.length > 0 ? (
                        item.comments.map((comment: Comment) => (
                          <div key={comment.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                              <span className="font-bold text-slate-900">{comment.authorName}</span>
                              <span className="text-[10px] font-mono">{formatPostTimestamp(comment.createdAt)}</span>
                            </div>
                            <p className="text-slate-700">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No community comments yet. Be the first to comment!</p>
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={commentInput[item.id] || ''}
                        onChange={(e) => setCommentInput({ ...commentInput, [item.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(item.id)}
                        placeholder="Write a comment..."
                        className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(item.id)}
                        disabled={isSubmittingComment || !commentInput[item.id]}
                        className="uiverse-slide-btn !py-2 !px-3 text-xs"
                      >
                        <span>SEND</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cookie-card bg-white w-full max-w-lg space-y-4">
            <div className="title text-slate-900 font-bold text-base flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="flex items-center">
                <Camera className="h-4 w-4 mr-2 text-blue-600" />
                Post New Road Problem with Evidence
              </span>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Problem Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe pothole, damaged asphalt, open manhole, or road hazard..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Municipal Ward</label>
                  <select
                    value={newWard}
                    onChange={(e) => setNewWard(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="WARD-12">Ward 12 (North)</option>
                    <option value="WARD-18">Ward 18 (East)</option>
                    <option value="WARD-24">Ward 24 (South)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Road Corridor Type</label>
                  <select
                    value={newRoadType}
                    onChange={(e) => setNewRoadType(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Arterial">Arterial Main Road</option>
                    <option value="Collector">Collector Road</option>
                    <option value="Local">Local Street</option>
                    <option value="Residential">Residential Lane</option>
                  </select>
                </div>
              </div>

              {/* Photo Image Upload Section */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                  <span>Attach Image Photo Evidence</span>
                  {uploadingPhoto && <span className="text-blue-600 font-normal">Uploading to Cloud...</span>}
                </label>
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1.5 shrink-0">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="or paste image URL..."
                    className="flex-1 text-xs p-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>

                {photoUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="actions pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="pref"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || uploadingPhoto}
                  className="uiverse-slide-btn"
                >
                  <span>{isSubmitting ? 'Posting...' : 'Post to Community Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
