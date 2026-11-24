"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Files,
  ListChecks,
  FolderOpen,
  FileText,
  Bell,
  Activity,
  User,
  ChevronRight,
  ChevronsUpDown,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  SlidersHorizontal,
  Check,
  CircleHelp,
  ShieldCheck,
  Building2,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-provider";
import { CountUp } from "@/components/count-up";
import { useSlidingIndicator } from "@/hooks/use-sliding-indicator";
const initialApps = [
  ["AC", "Amelia Clarke", "LN-2048", "Mortgage", "£485,000", "Under review", "2 hours ago"],
  ["HL", "Harriet Lawson", "LN-2051", "Business loan", "£250,000", "Documents required", "3 hours ago"],
  ["TF", "Thomas Fletcher", "LN-2057", "Personal loan", "£25,000", "New application", "4 hours ago"],
  ["IG", "Isabella Grant", "LN-2061", "Mortgage", "£375,000", "Ready for proposal", "5 hours ago"],
  ["GP", "George Pemberton", "LN-2064", "Car finance", "£32,000", "Under review", "Yesterday"],
];
const navigation = [
  ["Dashboard", LayoutDashboard],
  ["Applications", Files],
  ["Forms", ListChecks],
  ["Documents", FolderOpen],
  ["Reports", FileText],
  ["Notifications", Bell],
  ["Activity", Activity],
  ["Profile", User],
] as const;
/** Pipeline value (£m) over the last eleven months, for the hero sparkline. */
const pipelineTrend = [3.05, 3.2, 3.12, 3.45, 3.55, 3.48, 3.62, 3.81, 3.9, 3.732, 4.21];
const trendMonths = [
  "November 2025",
  "December 2025",
  "January 2026",
  "February 2026",
  "March 2026",
  "April 2026",
  "May 2026",
  "June 2026",
  "July 2026",
  "August 2026",
  "September 2026",
];
export default function Home() {
  const [page, setPage] = useState("Dashboard");
  const [role, setRole] = useState("Broker");
  const [filter, setFilter] = useState("All applications");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initialApps[0]);
  const [apps, setApps] = useState(initialApps);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const sync = () => {
      try {
        const v = JSON.parse(localStorage.getItem("os-submitted") || "null");
        if (v)
          setApps([
            ...initialApps,
            [
              "NA",
              v.name || "New applicant",
              "LN-2065",
              "Mortgage",
              "£" + Number(v.amount || 0).toLocaleString("en-GB"),
              "Submitted",
              "Just now",
            ],
          ]);
      } catch {}
    };
    sync();
    window.addEventListener("os-submit", sync);
    return () => window.removeEventListener("os-submit", sync);
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const context = (
      document as Document & { modelContext?: { registerTool: (tool: unknown, options: unknown) => void } }
    ).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      context.registerTool(
        {
          name: "navigate_workspace",
          description: "Open a section of the lending UI prototype.",
          inputSchema: {
            type: "object",
            properties: {
              page: {
                type: "string",
                enum: [
                  "Dashboard",
                  "Applications",
                  "Forms",
                  "Documents",
                  "Reports",
                  "Notifications",
                  "Activity",
                  "Profile",
                ],
              },
            },
            required: ["page"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input: { page: string }) => {
            if (!navigation.some(([name]) => name === input.page))
              throw new Error("Unknown workspace section");
            setPage(input.page);
            return { page: input.page };
          },
        },
        { signal: lifecycle.signal },
      );
    } catch {}
    return () => lifecycle.abort();
  }, []);
  const go = (p: string) => {
    setPage(p);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const switchRole = (r: string) => {
    if (r === role) return;
    setRole(r);
    go("Dashboard");
  };
  const broker = role === "Broker";
  /** Child pages keep their parent section selected so the sidebar always answers "where am I?". */
  const parent =
    page === "Application details" || page === "New application"
      ? "Applications"
      : ["Login", "Sign up", "Forgot password"].includes(page)
        ? "Profile"
        : null;
  const section = parent ?? page;
  const [navRef, navIndicatorRef] = useSlidingIndicator<HTMLElement>(".nav-item.active", section + role);
  return (
    <SidebarProvider style={{ "--sidebar-width": "264px" } as React.CSSProperties}>
      <Sidebar className="aven-sidebar">
        <SidebarHeader>
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go("Dashboard");
            }}
          >
            <Logo />
          </a>
          <button className="org" onClick={() => go("Profile")}>
            <span className="org-icon">
              <Building2 size={16} />
            </span>
            <span>
              Meridian Capital<small>Professional workspace</small>
            </span>
            <ChevronsUpDown size={14} />
          </button>
        </SidebarHeader>
        <SidebarContent>
          <nav aria-label="Workspace" className="side-nav" ref={navRef}>
            <span ref={navIndicatorRef} className="slide-indicator" aria-hidden="true" />
            <span className="nav-label">Workspace</span>
            {navigation
              .filter(([label]) => broker || !["Forms", "Reports"].includes(label))
              .map(([label, Icon]) => (
                <div key={label}>
                  {label === "Notifications" && <span className="nav-label spaced">Activity</span>}
                  {label === "Profile" && <span className="nav-label spaced">Account</span>}
                  <button
                    className={"nav-item " + (section === label ? "active" : "")}
                    aria-current={page === label ? "page" : undefined}
                    onClick={() => go(label)}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{label}</span>
                    {label === "Applications" && <b>{broker ? "24" : "1"}</b>}
                    {label === "Notifications" && <b className="unread-count">5</b>}
                  </button>
                </div>
              ))}
          </nav>
        </SidebarContent>
        <SidebarFooter>
          <button className="user-box" onClick={() => go("Profile")}>
            <span className="avatar me">{broker ? "OB" : "AC"}</span>
            <span>
              {broker ? "Oliver Bennett" : "Amelia Clarke"}
              <small>Meridian Capital</small>
            </span>
            <ChevronsUpDown size={14} />
          </button>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar" data-scrolled={scrolled || undefined}>
          <div className="breadcrumb">
            <SidebarTrigger className="mobile-menu" />
            <span className="crumb-root">Workspace</span>
            <ChevronRight size={14} className="crumb-sep" />
            {parent && (
              <>
                <button className="crumb-link" onClick={() => go(parent)}>
                  {parent}
                </button>
                <ChevronRight size={14} className="crumb-sep" />
              </>
            )}
            <b>{page === "Application details" ? selected[2] : page}</b>
          </div>
          <div className="top-actions">
            <div className="segmented role-switch" data-value={role} role="radiogroup" aria-label="View as">
              {["Broker", "Borrower"].map((r) => (
                <button
                  key={r}
                  role="radio"
                  aria-checked={role === r}
                  className={role === r ? "on" : ""}
                  onClick={() => switchRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <span className="top-divider" />
            <ThemeToggle />
            <button
              className="icon-btn help"
              aria-label="Help"
              onClick={() =>
                toast("Switch between Broker and Borrower at the top to see both sides of the workspace.")
              }
            >
              <CircleHelp size={18} />
            </button>
            <button
              aria-label="Notifications, 5 unread"
              className="icon-btn bell"
              onClick={() => go("Notifications")}
            >
              <Bell size={18} />
              <i className="bell-dot" aria-hidden="true" />
            </button>
            <button className="avatar me small" aria-label="Your profile" onClick={() => go("Profile")}>
              {broker ? "OB" : "AC"}
            </button>
          </div>
        </header>
        <main className="content">
          <div className="page" key={page + role}>
            {page === "Dashboard" ? (
              <>
                <div className="page-heading">
                  <div>
                    <div className="eyebrow">Friday 11 September</div>
                    <h1>{broker ? "Good morning, Oliver." : "Welcome back, Amelia."}</h1>
                    <p>
                      {broker
                        ? "Here’s where your pipeline stands this morning."
                        : "Pick up your mortgage application where you left off."}
                    </p>
                  </div>
                  <div className="heading-actions">
                    <button className="btn primary" onClick={() => go("New application")}>
                      <Plus size={16} strokeWidth={2.2} />
                      {broker ? "Create application" : "New application"}
                    </button>
                  </div>
                </div>
                {broker ? (
                  <>
                    <section className="pipeline" aria-label="Pipeline summary">
                      <PipelineCard />
                      <div className="metrics">
                        {(
                          [
                            [24, "Total applications", "total", "Across 4 loan types"],
                            [6, "New applications", "new", "3 received today"],
                            [8, "Under review", "review", "4 awaiting your review"],
                            [5, "Documents outstanding", "pending", "Action needed"],
                          ] as const
                        ).map(([value, label, cls, caption]) => (
                          <button
                            className={"metric " + cls}
                            key={label}
                            onClick={() => {
                              go("Applications");
                              setFilter(
                                cls === "review"
                                  ? "Under review"
                                  : cls === "pending"
                                    ? "Documents required"
                                    : "All applications",
                              );
                            }}
                          >
                            <span className="metric-label">{label}</span>
                            <strong>
                              <CountUp value={value} duration={700} />
                            </strong>
                            <span className="metric-bottom">
                              {caption}
                              {cls === "pending" && <ArrowUpRight size={14} />}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="attention-band">
                      <div className="attention-symbol" aria-hidden="true">
                        <ListChecks size={20} strokeWidth={2.1} />
                      </div>
                      <div>
                        <h3>Three applications are ready for a proposal</h3>
                        <p>Every supporting document has been verified.</p>
                      </div>
                      <button
                        className="btn"
                        onClick={() => {
                          go("Applications");
                          setFilter("Ready for proposal");
                        }}
                      >
                        Review applications <ArrowRight size={16} />
                      </button>
                    </section>
                  </>
                ) : (
                  <section className="borrower-feature">
                    <span className="eyebrow">Mortgage application LN-2048</span>
                    <h2>You’re nearly there.</h2>
                    <strong>£485,000</strong>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-valuenow={72}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <i style={{ width: "72%" }} />
                    </div>
                    <p>72% complete. Next, upload your latest payslip.</p>
                    <button className="btn primary" onClick={() => go("Documents")}>
                      Continue application <ArrowRight size={16} />
                    </button>
                  </section>
                )}
                <div className="dashboard-columns">
                  <section className="applications-section card">
                    <div className="section-heading">
                      <h2>
                        Recent applications <span>{broker ? "24" : "1"}</span>
                      </h2>
                      <button className="text-button" onClick={() => go("Applications")}>
                        View all <ChevronRight size={15} />
                      </button>
                    </div>
                    <div className="table-tabs">
                      <div className="segmented">
                        <button className="on">All</button>
                        <button
                          onClick={() => {
                            go("Applications");
                            setFilter("Under review");
                          }}
                        >
                          Under review
                        </button>
                        <button
                          onClick={() => {
                            go("Applications");
                            setFilter("Documents required");
                          }}
                        >
                          Documents outstanding
                        </button>
                      </div>
                      <button
                        className="icon-btn table-options"
                        aria-label="Filter applications"
                        onClick={() => go("Applications")}
                      >
                        <SlidersHorizontal size={16} />
                      </button>
                    </div>
                    <AppTable
                      apps={broker ? initialApps : initialApps.slice(0, 1)}
                      compact
                      onOpen={(a) => {
                        setSelected(a);
                        go("Application details");
                      }}
                    />
                    <div className="table-footer">
                      <span>
                        Showing {broker ? 5 : 1} of {broker ? 24 : 1}
                      </span>
                      <span>Updated just now</span>
                    </div>
                  </section>
                  <aside className={"attention-list card " + (broker ? "" : "borrower-hidden")}>
                    <div className="section-heading">
                      <h2>Needs attention</h2>
                      <span className="count amber">3</span>
                    </div>
                    {[
                      [
                        "amber",
                        "Missing documents",
                        "Harriet Lawson",
                        "LN-2051",
                        "Bank statement and SA302 tax calculation",
                        "2 documents",
                      ],
                      [
                        "rose",
                        "Replacement requested",
                        "Sophie Marsh",
                        "LN-2042",
                        "Payslip is not legible",
                        "1 document",
                      ],
                      [
                        "blue",
                        "Review requested",
                        "Amelia Clarke",
                        "LN-2048",
                        "Financial analysis is ready",
                        "Review",
                      ],
                    ].map(([color, title, name, id, desc, label]) => (
                      <button
                        className="attention-item"
                        key={title}
                        onClick={() => {
                          setSelected(title === "Missing documents" ? initialApps[1] : initialApps[0]);
                          go("Application details");
                        }}
                      >
                        <div>
                          <h3>
                            {title}
                            <ChevronRight size={15} />
                          </h3>
                          <b>
                            {name} <span className="ref">{id}</span>
                          </b>
                          <p>{desc}</p>
                          <span className={"badge " + color}>{label}</span>
                        </div>
                      </button>
                    ))}
                  </aside>
                </div>
                <section className="recent-activity card">
                  <div className="section-heading">
                    <h2>Latest activity</h2>
                    <button className="text-button" onClick={() => go("Activity")}>
                      View activity <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="activity-grid">
                    {[
                      ["check", "Passport verified", "Amelia Clarke’s mortgage", "12 minutes ago"],
                      ["upload", "Bank statement uploaded", "Harriet Lawson’s business loan", "38 minutes ago"],
                      ["new", "New application received", "Thomas Fletcher’s personal loan", "1 hour ago"],
                    ]
                      .filter((_, i) => broker || i === 0)
                      .map(([type, title, sub, time]) => (
                        <div className="activity-event" key={title}>
                          <span className={"event-icon " + type}>
                            {type === "check" ? (
                              <Check size={16} strokeWidth={2.6} />
                            ) : type === "upload" ? (
                              <FolderOpen size={16} strokeWidth={2.2} />
                            ) : (
                              <Files size={16} strokeWidth={2.2} />
                            )}
                          </span>
                          <div>
                            <b>{title}</b>
                            <p>{sub}</p>
                            <small>{time}</small>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </>
            ) : page === "Applications" ? (
              <>
                <PageHeading
                  title={broker ? "Applications" : "My applications"}
                  desc="Every application, from first enquiry to final proposal."
                  action="New application"
                  onAction={() => go("New application")}
                />
                <div className="filterbar">
                  <div className="search">
                    <Search size={16} />
                    <input
                      aria-label="Search applications"
                      placeholder="Search by name or reference"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                    />
                    <button
                      type="button"
                      className={"search-clear" + (query ? " shown" : "")}
                      aria-label="Clear search"
                      tabIndex={query ? 0 : -1}
                      onClick={() => setQuery("")}
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="filter-select">
                      <SlidersHorizontal size={15} />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "All applications",
                        "New application",
                        "Under review",
                        "Documents required",
                        "Ready for proposal",
                        "Submitted",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="card table-card">
                  <AppTable
                    apps={(broker ? apps : apps.filter((a) => a[2] === "LN-2048" || a[2] === "LN-2065")).filter(
                      (a) =>
                        a.join(" ").toLowerCase().includes(query.toLowerCase()) &&
                        (filter === "All applications" || a[5] === filter),
                    )}
                    onOpen={(a) => {
                      setSelected(a);
                      go("Application details");
                    }}
                  />
                </div>
              </>
            ) : page === "Application details" ? (
              <ApplicationDetail app={selected} role={role} />
            ) : (
              <ExtraPage key={page} page={page} role={role} go={go} />
            )}
          </div>
          <footer className="page-footer">
            <span>© 2026 One Sovereign</span>
            <span>
              <ShieldCheck size={13} /> Secure workspace
              <span className="footer-gap" />
              All systems operational
            </span>
          </footer>
        </main>
      </div>
      <Toaster position="bottom-right" />
      <CloseMobileSidebarOnNavigate page={page + role} />
    </SidebarProvider>
  );
}
/** On phones the sidebar is a sheet; choosing a destination should dismiss it. */
function CloseMobileSidebarOnNavigate({ page }: { page: string }) {
  const { setOpenMobile } = useSidebar();
  useEffect(() => setOpenMobile(false), [page, setOpenMobile]);
  return null;
}
/**
 * Hero pipeline card. Scrubbing the chart (hover, or drag on touch) swaps the headline
 * for that month's figure, the way Stocks does; letting go returns to today.
 */
function PipelineCard() {
  const [scrub, setScrub] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const last = pipelineTrend.length - 1;
  const i = scrub ?? last;
  const value = pipelineTrend[i];
  const prev = pipelineTrend[Math.max(0, i - 1)];
  const change = i === 0 ? 0 : ((value - prev) / prev) * 100;
  const onScrub = (next: number | null) => {
    if (next !== null && !touched) setTouched(true);
    setScrub(next);
  };
  return (
    <div className={"pipeline-total" + (scrub !== null ? " scrubbing" : "")}>
      <div className="metric-label">{scrub === null ? "Active pipeline" : trendMonths[i]}</div>
      <strong aria-live="polite">
        {touched ? (
          <span className="count-up">£{value.toFixed(2)}</span>
        ) : (
          <CountUp value={4.21} decimals={2} prefix="£" />
        )}
        <span className="unit">m</span>
      </strong>
      <div className="growth">
        <span className={"growth-pill" + (change < 0 ? " down" : "")}>
          {change < 0 ? (
            <TrendingDown size={13} strokeWidth={2.4} />
          ) : (
            <TrendingUp size={13} strokeWidth={2.4} />
          )}
          {Math.abs(change).toFixed(1)}%
        </span>
        <span>on previous month</span>
      </div>
      <Sparkline values={pipelineTrend} active={scrub} onScrub={onScrub} />
    </div>
  );
}
function Sparkline({
  values,
  active,
  onScrub,
}: {
  values: number[];
  active: number | null;
  onScrub: (i: number | null) => void;
}) {
  const w = 240;
  const h = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - 6 - ((v - min) / (max - min || 1)) * (h - 16),
  ]);
  const line = pts.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    onScrub(Math.round(ratio * (values.length - 1)));
  };
  const at = active === null ? null : pts[active];
  return (
    <div
      className="spark-wrap"
      onPointerMove={pick}
      onPointerDown={pick}
      onPointerLeave={() => onScrub(null)}
      onPointerCancel={() => onScrub(null)}
      onPointerUp={(e) => e.pointerType !== "mouse" && onScrub(null)}
    >
      <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--tint)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--tint)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="url(#spark-fill)" />
        <path d={line} fill="none" stroke="var(--tint)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      {at && (
        <>
          <span className="scrub-line" style={{ left: `${(at[0] / w) * 100}%` }} />
          <span className="scrub-point" style={{ left: `${(at[0] / w) * 100}%`, top: `${(at[1] / h) * 100}%` }} />
        </>
      )}
    </div>
  );
}
function PageHeading({
  title,
  desc,
  action,
  onAction,
  eyebrow,
}: {
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
  eyebrow?: string;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action && (
        <button className="btn primary" onClick={onAction}>
          {/^(New|Create)/.test(action) ? (
            <Plus size={16} strokeWidth={2.2} />
          ) : (
            <Check size={16} strokeWidth={2.4} />
          )}
          {action}
        </button>
      )}
    </div>
  );
}
function AppTable({
  apps,
  onOpen,
  compact = false,
}: {
  apps: string[][];
  onOpen: (a: string[]) => void;
  compact?: boolean;
}) {
  return (
    <div className="app-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            {!compact && <TableHead>Last updated</TableHead>}
            <TableHead>
              <span className="sr-only">Open</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((a) => (
            <TableRow
              key={a[2]}
              onClick={() => onOpen(a)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onOpen(a)}
            >
              <TableCell>
                <div className="borrower-cell">
                  <span className="avatar">{a[0]}</span>
                  <span>
                    <b>{a[1]}</b>
                    <small>
                      <span>{a[3]}</span>
                      <span className="ref">{a[2]}</span>
                    </small>
                  </span>
                </div>
              </TableCell>
              <TableCell className="amount">{a[4]}</TableCell>
              <TableCell>
                <Status value={a[5]} />
              </TableCell>
              {!compact && <TableCell className="muted-cell">{a[6]}</TableCell>}
              <TableCell className="chev-cell">
                <ChevronRight size={16} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!apps.length && (
        <div className="empty-state">
          <Search size={22} />
          <b>No results</b>
          <span>No applications match this view. Try another filter.</span>
        </div>
      )}
    </div>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span
      key={value}
      className={
        "badge " +
        (/Verified|Ready|Final|Completed|Published|Low concern/.test(value)
          ? "green"
          : /required|Missing|Medium/.test(value)
            ? "amber"
            : /Rejected/.test(value)
              ? "rose"
              : /New|Submitted|Uploaded|Uploading/.test(value)
                ? "blue"
                : /review/i.test(value)
                  ? "indigo"
                  : "neutral")
      }
    >
      {value === "Uploading" && <span className="spinner" aria-hidden="true" />}
      {value}
    </span>
  );
}
import { ExtraPage, ApplicationDetail } from "./workspace";
export { PageHeading, Status };
