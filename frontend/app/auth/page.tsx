"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getSportsbookMeta, SportsbookLogo } from "../components/sportsbookMeta";

type AuthMode = "login" | "signup";
type MessageTone = "success" | "error" | "info";
type SignupStep = 1 | 2 | 3;
type TierOption = "" | "select" | "premium" | "executive";

type TutorialItem = {
  eyebrow: string;
  title: string;
  duration: string;
  description: string;
  points: string[];
};

type SignupFormState = {
  email: string;
  tier: TierOption;
  username: string;
  promoCode: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  maxBet: string;
  experienceLevel: string;
  bettingGoal: string;
  yearlyProfitTarget: string;
  betFrequency: string;
};

const TOKEN_STORAGE_KEY = "unbounded.access_token";
const SAVED_EMAIL_KEY = "unbounded.saved_email";
const SIGNUP_TAB_KEY = "unbounded.active_signup_tab";

const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" }
];

const REGION_OPTIONS: Record<string, { value: string; label: string }[]> = {
  US: [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "MA", label: "Massachusetts" },
    { value: "MD", label: "Maryland" },
    { value: "ME", label: "Maine" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MO", label: "Missouri" },
    { value: "MS", label: "Mississippi" },
    { value: "MT", label: "Montana" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "NE", label: "Nebraska" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NV", label: "Nevada" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VA", label: "Virginia" },
    { value: "VT", label: "Vermont" },
    { value: "WA", label: "Washington" },
    { value: "WI", label: "Wisconsin" },
    { value: "WV", label: "West Virginia" },
    { value: "WY", label: "Wyoming" }
  ],
  CA: [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "ON", label: "Ontario" },
    { value: "QC", label: "Quebec" }
  ],
  UK: [
    { value: "ENG", label: "England" },
    { value: "NIR", label: "Northern Ireland" },
    { value: "SCT", label: "Scotland" },
    { value: "WLS", label: "Wales" }
  ],
  AU: [
    { value: "NSW", label: "New South Wales" },
    { value: "QLD", label: "Queensland" },
    { value: "SA", label: "South Australia" },
    { value: "VIC", label: "Victoria" },
    { value: "WA", label: "Western Australia" }
  ]
};

const GLOBAL_SPORTSBOOKS = [
  "Bet365",
  "BetMGM",
  "BetRivers",
  "Caesars",
  "DraftKings",
  "ESPN BET",
  "Fanatics",
  "FanDuel",
  "Hard Rock Bet",
  "Paddy Power",
  "PointsBet",
  "Sportsbet",
  "TAB",
  "William Hill"
];

const SPORTSBOOKS_BY_COUNTRY: Record<string, string[]> = {
  US: [
    "FanDuel",
    "DraftKings",
    "BetMGM",
    "Caesars",
    "ESPN BET",
    "Fanatics",
    "BetRivers",
    "Hard Rock Bet",
    "PointsBet",
    "Bet365"
  ],
  CA: ["Bet365", "BetMGM", "DraftKings", "FanDuel", "BetRivers"],
  UK: ["Bet365", "Betfair", "Paddy Power", "William Hill", "Ladbrokes"],
  AU: ["Sportsbet", "TAB", "Neds", "Ladbrokes", "Bet365"]
};

const LEGAL_SPORTSBOOKS_BY_REGION: Record<string, string[]> = {
  US: ["FanDuel", "DraftKings", "BetMGM", "Caesars", "BetRivers"],
  "US:AZ": ["FanDuel", "DraftKings", "BetMGM", "Caesars", "ESPN BET"],
  "US:CO": ["FanDuel", "DraftKings", "BetMGM", "Caesars", "Bet365", "Fanatics"],
  "US:IL": ["FanDuel", "DraftKings", "BetMGM", "Caesars", "Fanatics", "BetRivers"],
  "US:NJ": ["FanDuel", "DraftKings", "BetMGM", "Caesars", "Bet365", "Hard Rock Bet"],
  "US:NY": ["FanDuel", "DraftKings", "BetMGM", "Caesars", "BetRivers"],
  "US:PA": ["FanDuel", "DraftKings", "BetMGM", "Caesars", "BetRivers", "ESPN BET"],
  CA: ["Bet365", "BetMGM", "DraftKings", "BetRivers"],
  UK: ["Bet365", "Betfair", "Paddy Power", "William Hill"],
  AU: ["Sportsbet", "TAB", "Neds", "Ladbrokes", "Bet365"]
};

const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Sharp"];
const BET_FREQUENCY_OPTIONS = [
  "A few bets per week",
  "Daily",
  "A few times a day",
  "High volume"
];
const GOAL_OPTIONS = [
  "Find the best odds",
  "Build steady profit",
  "Track promos and boosts",
  "Learn EV and arbitrage"
];
const INITIAL_VISIBLE_SPORTSBOOKS = 8;
const TIER_OPTIONS: {
  value: Exclude<TierOption, "">;
  label: string;
  accent: string;
  description: string;
  features: string[];
}[] = [
  {
    value: "select",
    label: "Select",
    accent: "red",
    description: "Entry access for testing the core arbitrage workflow.",
    features: [
      "Moneyline arbitrage access",
      "Limited +EV and live odds coverage",
      "Profit calculator",
      "Public leaderboard and top bets feed",
      "7-day free trial"
    ]
  },
  {
    value: "premium",
    label: "Premium",
    accent: "silver",
    description: "Full board access for active bettors who want sharper filters.",
    features: [
      "All arbitrage and +EV bets",
      "Live odds and fastest withdrawal methods",
      "Friction score and trust scoring",
      "No ads or pop-ups",
      "Daily top bets and recommendations"
    ]
  },
  {
    value: "executive",
    label: "Executive",
    accent: "gold",
    description: "Highest-signal tier for operators who want priority tools.",
    features: [
      "Everything in Premium",
      "AI bet recommendations and smart parlay builder",
      "Time-to-decay meter and historical odds",
      "Predictive line movement signals",
      "Private Executive leaderboard"
    ]
  }
];

const MAX_PASSWORD_LENGTH = 100;
const MAX_USERNAME_LENGTH = 24;
const PROFANITY_PATTERNS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "whore",
  "slut"
];
const PASSWORD_REQUIREMENTS = [
  "10 to 100 characters",
  "At least 1 uppercase letter",
  "At least 1 number",
  "At least 1 symbol",
  "No spaces",
  "No profanity"
];

const DEFAULT_TUTORIALS: TutorialItem[] = [
  {
    eyebrow: "Recommended tutorial",
    title: "How Unbounded finds strong daily spots",
    duration: "6 min",
    description:
      "Start with the dashboard workflow so you know where to scan, what to ignore, and how to move quickly between boards.",
    points: [
      "Reading the main boards",
      "Filtering by books and sports",
      "Knowing which numbers matter first"
    ]
  },
  {
    eyebrow: "Recommended tutorial",
    title: "Turning raw odds into cleaner decisions",
    duration: "8 min",
    description:
      "Learn the basic rhythm for checking odds, sizing bets, and deciding whether a line is worth your time.",
    points: [
      "Quick sanity checks",
      "Comparing books without overthinking",
      "Logging decisions so you improve faster"
    ]
  },
  {
    eyebrow: "Recommended tutorial",
    title: "Tracking profit and closing the loop",
    duration: "5 min",
    description:
      "Use profit tracking to keep your results honest and spot where your process is actually working.",
    points: [
      "What to log after each bet",
      "How to read your profit curve",
      "Finding leaks in your routine"
    ]
  }
];

const TUTORIALS_BY_EXPERIENCE: Record<string, TutorialItem[]> = {
  Beginner: [
    {
      eyebrow: "Beginner path",
      title: "Arb and EV basics without the noise",
      duration: "7 min",
      description:
        "A clean intro to the two core bet types, what makes them different, and how to avoid rookie mistakes.",
      points: [
        "What arbitrage means in practice",
        "Why EV can lose in the short term",
        "How to think in samples, not single bets"
      ]
    },
    {
      eyebrow: "Beginner path",
      title: "Reading odds in under five minutes",
      duration: "5 min",
      description:
        "Get comfortable with American odds, implied probability, and the numbers you should compare first.",
      points: [
        "Converting odds mentally",
        "Spotting price differences quickly",
        "Knowing when a line is too thin"
      ]
    },
    {
      eyebrow: "Beginner path",
      title: "First-week setup for tracking results",
      duration: "6 min",
      description:
        "Build a simple routine so your early bets teach you something useful instead of becoming random history.",
      points: [
        "Setting a practical max bet",
        "Choosing realistic goals",
        "Using the tracker without overcomplicating it"
      ]
    }
  ],
  Intermediate: [
    {
      eyebrow: "Intermediate path",
      title: "Finding higher-quality EV faster",
      duration: "8 min",
      description:
        "Tighten your filtering so you spend less time scrolling and more time acting on the right opportunities.",
      points: [
        "Prioritizing the best markets",
        "Using book filters effectively",
        "Avoiding stale numbers"
      ]
    },
    {
      eyebrow: "Intermediate path",
      title: "Sizing bets with discipline",
      duration: "7 min",
      description:
        "Move from flat betting toward a more deliberate staking process that still stays practical.",
      points: [
        "Balancing edge and bankroll",
        "When to pass instead of force volume",
        "How bet frequency changes your plan"
      ]
    },
    {
      eyebrow: "Intermediate path",
      title: "Using the profit tracker to adjust strategy",
      duration: "6 min",
      description:
        "Look at your historical results the way a sharper bettor would and make changes based on evidence.",
      points: [
        "Separating signal from variance",
        "Comparing books and markets",
        "Refining your process month to month"
      ]
    }
  ],
  Advanced: [
    {
      eyebrow: "Advanced path",
      title: "Reducing friction in your daily workflow",
      duration: "9 min",
      description:
        "Build a faster routine across filters, calculators, and trackers so execution keeps up with your edge.",
      points: [
        "Moving between tools without context loss",
        "Prioritizing books by value and speed",
        "Cleaning up your daily process"
      ]
    },
    {
      eyebrow: "Advanced path",
      title: "Protecting edge with better review loops",
      duration: "8 min",
      description:
        "Use your own history to check whether your volume, bet size, and market mix still make sense.",
      points: [
        "Auditing your assumptions",
        "Detecting soft regressions early",
        "Separating process drift from variance"
      ]
    },
    {
      eyebrow: "Advanced path",
      title: "Scaling without getting sloppy",
      duration: "7 min",
      description:
        "Advanced workflows break when execution quality drops. This tutorial focuses on keeping your process tight.",
      points: [
        "Managing more books cleanly",
        "Keeping limits and goals aligned",
        "Staying selective at higher volume"
      ]
    }
  ],
  Sharp: [
    {
      eyebrow: "Sharp path",
      title: "Workflow tuning for high-volume users",
      duration: "9 min",
      description:
        "This is the fast path for users who already know the concepts and want the platform workflow optimized.",
      points: [
        "Compressing scan-to-bet time",
        "Structuring filters by decision priority",
        "Using tracking as an execution audit"
      ]
    },
    {
      eyebrow: "Sharp path",
      title: "Improving review quality, not just volume",
      duration: "6 min",
      description:
        "Use tighter post-bet review loops so your edge stays durable instead of turning into noise.",
      points: [
        "Reviewing market mix and hold",
        "Spotting weak bet clusters",
        "Keeping your process adaptive"
      ]
    },
    {
      eyebrow: "Sharp path",
      title: "Getting more from the calculator and tracker",
      duration: "5 min",
      description:
        "A short workflow tutorial focused on the tools that matter once you already understand the underlying math.",
      points: [
        "Faster verification workflows",
        "Cleaner profit-tracking discipline",
        "Making the tools work like a single system"
      ]
    }
  ]
};

const DEFAULT_SIGNUP_FORM: SignupFormState = {
  email: "",
  tier: "",
  username: "",
  promoCode: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
  country: "US",
  state: "",
  maxBet: "",
  experienceLevel: "",
  bettingGoal: "",
  yearlyProfitTarget: "",
  betFrequency: ""
};

function getRegionLabel(country: string) {
  if (country === "CA") {
    return "Province";
  }
  if (country === "UK" || country === "AU") {
    return "Region";
  }
  return "State";
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function getEmailForApi(value: string) {
  const normalized = value.trim();
  return normalized.includes("@") ? normalized : null;
}

function includesProfanity(value: string) {
  const normalized = value.toLowerCase();
  return PROFANITY_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function validateUsername(value: string) {
  const username = value.trim();

  if (username.length < 3 || username.length > MAX_USERNAME_LENGTH) {
    return `Username must be 3 to ${MAX_USERNAME_LENGTH} characters.`;
  }

  if (/\s/.test(username)) {
    return "Username cannot include spaces.";
  }

  if (!/^[A-Za-z0-9._-]+$/.test(username)) {
    return "Username can only use letters, numbers, periods, underscores, and hyphens.";
  }

  if (includesProfanity(username)) {
    return "Choose a different username.";
  }

  return null;
}

function validatePassword(value: string) {
  if (value.length < 10 || value.length > MAX_PASSWORD_LENGTH) {
    return `Password must be 10 to ${MAX_PASSWORD_LENGTH} characters.`;
  }

  if (/\s/.test(value)) {
    return "Password cannot include spaces.";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/[0-9]/.test(value)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Password must include at least one symbol.";
  }

  if (includesProfanity(value)) {
    return "Password cannot include profanity.";
  }

  return null;
}

function validateDateOfBirth(value: string) {
  if (!value) {
    return "Date of birth is required for age verification.";
  }

  const today = new Date();
  const dob = new Date(`${value}T00:00:00`);

  if (Number.isNaN(dob.getTime()) || dob > today) {
    return "Enter a valid date of birth.";
  }

  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  if (age < 18) {
    return "You must be at least 18 years old to create an account.";
  }

  return null;
}

export default function AuthPage() {
  const router = useRouter();
  const signupTabIdRef = useRef("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [signupForm, setSignupForm] = useState<SignupFormState>(DEFAULT_SIGNUP_FORM);
  const [selectedSportsbooks, setSelectedSportsbooks] = useState<string[]>([]);
  const [sportsbookSearch, setSportsbookSearch] = useState("");
  const [showAllSportsbooks, setShowAllSportsbooks] = useState(false);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [didSkipPreferences, setDidSkipPreferences] = useState(false);
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (!signupTabIdRef.current) {
    signupTabIdRef.current = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }

  const apiBase = useMemo(() => {
    const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

    if (configuredApiUrl) {
      return configuredApiUrl;
    }

    return process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";
  }, []);

  const loginEndpoint =
    process.env.NEXT_PUBLIC_AUTH_LOGIN_URL || `${apiBase}/auth/login`;
  const signupEndpoint =
    process.env.NEXT_PUBLIC_AUTH_SIGNUP_URL || `${apiBase}/auth/signup`;
  const forgotPasswordEndpoint = `${apiBase}/auth/forgot-password`;
  const resendVerificationEndpoint = `${apiBase}/auth/resend-verification`;
  const isLoginApiConfigured = Boolean(
    apiBase || process.env.NEXT_PUBLIC_AUTH_LOGIN_URL
  );
  const isSignupApiConfigured = Boolean(
    apiBase || process.env.NEXT_PUBLIC_AUTH_SIGNUP_URL
  );

  const regionOptions = useMemo(
    () => REGION_OPTIONS[signupForm.country] || [],
    [signupForm.country]
  );
  const regionLabel = getRegionLabel(signupForm.country);

  const sportsbookOptions = useMemo(() => {
    return uniqueValues([
      ...(SPORTSBOOKS_BY_COUNTRY[signupForm.country] || []),
      ...GLOBAL_SPORTSBOOKS
    ]).sort((left, right) => left.localeCompare(right));
  }, [signupForm.country]);

  const legalSportsbooks = useMemo(() => {
    if (signupForm.state) {
      return LEGAL_SPORTSBOOKS_BY_REGION[`${signupForm.country}:${signupForm.state}`] || [];
    }

    return LEGAL_SPORTSBOOKS_BY_REGION[signupForm.country] || [];
  }, [signupForm.country, signupForm.state]);

  const filteredSportsbookOptions = useMemo(() => {
    const normalizedSearch = sportsbookSearch.trim().toLowerCase();
    const filtered = sportsbookOptions.filter((sportsbook) =>
      sportsbook.toLowerCase().includes(normalizedSearch)
    );

    return [...filtered].sort((left, right) => {
      const leftLegal = legalSportsbooks.includes(left) ? 1 : 0;
      const rightLegal = legalSportsbooks.includes(right) ? 1 : 0;

      if (leftLegal !== rightLegal) {
        return rightLegal - leftLegal;
      }

      return left.localeCompare(right);
    });
  }, [legalSportsbooks, sportsbookOptions, sportsbookSearch]);

  const visibleSportsbookOptions = useMemo(() => {
    if (showAllSportsbooks || sportsbookSearch.trim()) {
      return filteredSportsbookOptions;
    }

    return filteredSportsbookOptions.slice(0, INITIAL_VISIBLE_SPORTSBOOKS);
  }, [filteredSportsbookOptions, showAllSportsbooks, sportsbookSearch]);
  const allFilteredSportsbooksSelected =
    filteredSportsbookOptions.length > 0 &&
    filteredSportsbookOptions.every((sportsbook) =>
      selectedSportsbooks.includes(sportsbook)
    );

  const recommendedTutorials = useMemo(() => {
    return (
      TUTORIALS_BY_EXPERIENCE[signupForm.experienceLevel] || DEFAULT_TUTORIALS
    );
  }, [signupForm.experienceLevel]);

  const activeTutorial = recommendedTutorials[tutorialIndex] || recommendedTutorials[0];

  useEffect(() => {
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  useEffect(() => {
    if (mode !== "signup") {
      const activeSignupTab = localStorage.getItem(SIGNUP_TAB_KEY);
      if (activeSignupTab === signupTabIdRef.current) {
        localStorage.removeItem(SIGNUP_TAB_KEY);
      }
      return;
    }

    const activeSignupTab = localStorage.getItem(SIGNUP_TAB_KEY);
    if (!activeSignupTab) {
      localStorage.setItem(SIGNUP_TAB_KEY, signupTabIdRef.current);
    }

    const releaseSignupTab = () => {
      if (localStorage.getItem(SIGNUP_TAB_KEY) === signupTabIdRef.current) {
        localStorage.removeItem(SIGNUP_TAB_KEY);
      }
    };

    window.addEventListener("beforeunload", releaseSignupTab);
    return () => {
      window.removeEventListener("beforeunload", releaseSignupTab);
      releaseSignupTab();
    };
  }, [mode]);

  useEffect(() => {
    if (!regionOptions.some((option) => option.value === signupForm.state)) {
      setSignupForm((current) => ({ ...current, state: "" }));
    }
  }, [regionOptions, signupForm.state]);

  const readErrorMessage = async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (typeof data?.detail === "string") {
          return data.detail;
        }
        if (Array.isArray(data?.detail)) {
          const detailText = data.detail
            .map((item: { msg?: string }) => item?.msg)
            .filter(Boolean)
            .join(" ");
          if (detailText) {
            return detailText;
          }
        }
        if (typeof data?.message === "string") {
          return data.message;
        }
      } else {
        const text = await response.text();
        if (contentType.includes("text/html") || text.trim().startsWith("<")) {
          return "The auth API is not configured correctly. Check NEXT_PUBLIC_API_URL on the frontend deployment.";
        }
        if (text) {
          return text.slice(0, 240);
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  const resetSignupFlow = () => {
    setSignupStep(1);
    setSignupForm(DEFAULT_SIGNUP_FORM);
    setSelectedSportsbooks([]);
    setTutorialIndex(0);
    setSportsbookSearch("");
    setShowAllSportsbooks(false);
    setPasswordError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setDidSkipPreferences(false);
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage(null);
    setMessageTone("info");
    setPasswordError(null);

    if (nextMode === "login") {
      const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
      setLoginPassword("");
      resetSignupFlow();
      return;
    }

    resetSignupFlow();
  };

  const updateSignupField = (field: keyof SignupFormState, value: string) => {
    setSignupForm((current) => ({ ...current, [field]: value }));
    if (field === "email" && rememberEmail) {
      localStorage.setItem(SAVED_EMAIL_KEY, value.trim());
    }
    if (field === "username" || field === "password" || field === "confirmPassword") {
      setPasswordError(null);
    }
    if (field === "country") {
      setSelectedSportsbooks([]);
      setSportsbookSearch("");
      setShowAllSportsbooks(false);
    }
    if (field === "state") {
      setSelectedSportsbooks([]);
      setSportsbookSearch("");
      setShowAllSportsbooks(false);
    }
  };

  const claimSignupTab = () => {
    const activeSignupTab = localStorage.getItem(SIGNUP_TAB_KEY);
    if (activeSignupTab && activeSignupTab !== signupTabIdRef.current) {
      setMessageTone("error");
      setMessage(
        "Signup is already open in another tab. Finish or close that tab before starting another signup."
      );
      return false;
    }

    localStorage.setItem(SIGNUP_TAB_KEY, signupTabIdRef.current);
    return true;
  };

  const clearSignupTab = () => {
    if (localStorage.getItem(SIGNUP_TAB_KEY) === signupTabIdRef.current) {
      localStorage.removeItem(SIGNUP_TAB_KEY);
    }
  };

  const validateSignupStepOne = () => {
    const dobError = validateDateOfBirth(signupForm.dateOfBirth);
    if (dobError) {
      setPasswordError(dobError);
      return false;
    }

    const usernameError = validateUsername(signupForm.username);
    if (usernameError) {
      setPasswordError(usernameError);
      return false;
    }

    const passwordValidation = validatePassword(signupForm.password);
    if (passwordValidation) {
      setSignupForm((current) => ({
        ...current,
        password: "",
        confirmPassword: ""
      }));
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordError(`${passwordValidation} Password fields were cleared.`);
      return false;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupForm((current) => ({
        ...current,
        password: "",
        confirmPassword: ""
      }));
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordError(
        "Passwords did not match. Password fields were cleared so you can re-enter them."
      );
      return false;
    }
    return true;
  };

  const hydrateLegalSportsbooks = () => {
    setSelectedSportsbooks((current) => {
      if (current.length > 0) {
        return current;
      }
      return legalSportsbooks;
    });
  };

  const goToTutorialStep = (skippedPreferences: boolean) => {
    setSignupStep(3);
    setTutorialIndex(0);
    setDidSkipPreferences(skippedPreferences);
  };

  const completeSignup = async (skippedTutorials: boolean) => {
    if (isSubmitting) {
      return;
    }

    if (!claimSignupTab()) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setPasswordError(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    try {
      const emailForApi = getEmailForApi(signupForm.email);
      if (!emailForApi) {
        setMessageTone("error");
        setMessage("Use an email address for signup for now.");
        return;
      }

      if (!isSignupApiConfigured) {
        setMessageTone("error");
        setMessage(
          "The signup API is not configured. Add NEXT_PUBLIC_API_URL to the frontend deployment and redeploy."
        );
        return;
      }

      const response = await fetch(signupEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForApi,
          password: signupForm.password,
          tier: signupForm.tier || null,
          username: signupForm.username.trim(),
          promo_code: signupForm.promoCode.trim() || null,
          date_of_birth: signupForm.dateOfBirth,
          country: signupForm.country,
          state: signupForm.state,
          max_bet: signupForm.maxBet,
          experience_level: signupForm.experienceLevel,
          betting_goal: signupForm.bettingGoal,
          yearly_profit_target: signupForm.yearlyProfitTarget,
          bet_frequency: signupForm.betFrequency,
          preferred_sportsbooks: selectedSportsbooks,
          legal_sportsbooks: legalSportsbooks,
          recommended_tutorial_titles: recommendedTutorials.map(
            (tutorial) => tutorial.title
          ),
          active_tutorial_title: activeTutorial?.title || null,
          active_tutorial_index: activeTutorial
            ? recommendedTutorials.findIndex(
                (tutorial) => tutorial.title === activeTutorial.title
              )
            : null,
          skipped_preferences: didSkipPreferences,
          skipped_tutorials: skippedTutorials
        })
      });
      localStorage.removeItem(TOKEN_STORAGE_KEY);

      if (response.status === 429) {
        setMessageTone("error");
        setMessage("Too many attempts. Please wait a minute and try again.");
        return;
      }

      if (response.status === 503) {
        setMessageTone("error");
        setMessage("Auth is warming up. Please try again in a moment.");
        return;
      }

      if (!response.ok) {
        const detail = await readErrorMessage(response);
        setMessageTone("error");
        setMessage(detail || "Something went wrong. Please try again.");
        return;
      }

      const payload = await response.json();

      if (rememberEmail) {
        localStorage.setItem(SAVED_EMAIL_KEY, signupForm.email.trim());
      }

      setMode("login");
      setSignupStep(1);
      setEmail(signupForm.email.trim());
      setLoginPassword("");
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      resetSignupFlow();
      clearSignupTab();
      setMessageTone("success");
      setMessage(
        typeof payload.message === "string"
          ? payload.message
          : "Account created. Check your email to verify the account before logging in."
      );
    } catch (error) {
      const details =
        error instanceof Error ? error.message : String(error ?? "");
      setMessageTone("error");
      setMessage(
        `Network error${details ? ` (${details})` : ""}. API: ${signupEndpoint}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setMessage(null);
    setPasswordError(null);

    if (mode === "signup" && signupStep === 1) {
      if (!claimSignupTab()) {
        return;
      }
      if (!validateSignupStepOne()) {
        return;
      }
      setDidSkipPreferences(false);
      setSignupStep(2);
      hydrateLegalSportsbooks();
      return;
    }

    if (mode === "signup" && signupStep === 2) {
      if (selectedSportsbooks.length === 0) {
        setMessageTone("error");
        setMessage("Select at least one sportsbook or press Skip.");
        return;
      }
      goToTutorialStep(false);
      return;
    }

    if (mode === "signup") {
      await completeSignup(false);
      return;
    }

    const emailValue = getEmailForApi(email);

    if (!emailValue) {
      setMessageTone("error");
      setMessage(
        "Use the email address on your account. Username and phone login are not connected yet."
      );
      return;
    }

    if (rememberEmail) {
      localStorage.setItem(SAVED_EMAIL_KEY, emailValue);
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY);
    }

    if (!isLoginApiConfigured) {
      setMessageTone("error");
      setMessage(
        "The login API is not configured. Add NEXT_PUBLIC_API_URL to the frontend deployment and redeploy."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: loginPassword })
      });

      if (response.status === 401) {
        setEmail("");
        setLoginPassword("");
        setMessageTone("error");
        setMessage("Wrong username / password.");
        return;
      }

      if (response.status === 403) {
        setLoginPassword("");
        setMessageTone("error");
        setMessage("Verify your email before logging in. Check your inbox or request a new verification link.");
        return;
      }

      if (response.status === 429) {
        setMessageTone("error");
        setMessage("Too many attempts. Please wait a minute and try again.");
        return;
      }

      if (response.status === 503) {
        setMessageTone("error");
        setMessage("Auth is warming up. Please try again in a moment.");
        return;
      }

      if (!response.ok) {
        setEmail("");
        setLoginPassword("");
        setMessageTone("error");
        setMessage("Wrong username / password.");
        return;
      }

      const payload = await response.json();
      const accessToken =
        payload.access_token || payload.accessToken || payload.token;

      if (!accessToken) {
        setMessageTone("error");
        setMessage("Login succeeded but no token was returned.");
        return;
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      setMessageTone("success");
      setMessage("Authenticated. Redirecting to dashboard...");
      setLoginPassword("");
      router.push("/dashboard");
    } catch (error) {
      const details =
        error instanceof Error ? error.message : String(error ?? "");
      setMessageTone("error");
      setMessage(
        `Network error${details ? ` (${details})` : ""}. API: ${loginEndpoint}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSportsbook = (sportsbook: string) => {
    setSelectedSportsbooks((current) =>
      current.includes(sportsbook)
        ? current.filter((item) => item !== sportsbook)
        : [...current, sportsbook]
    );
  };

  const handleForgotPasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const identifier = forgotIdentifier.trim();

    if (!identifier) {
      setForgotMessage("Enter the email, phone, or username on the account.");
      return;
    }

    if (!identifier.includes("@")) {
      setForgotMessage(
        "Password recovery currently sends to the email on the account. Enter that email to continue."
      );
      return;
    }

    try {
      const response = await fetch(forgotPasswordEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier })
      });
      setForgotMessage(
        response.ok
          ? "If an account exists for that email, reset instructions will be sent."
          : "Password reset is unavailable right now. Try again in a moment."
      );
    } catch {
      setForgotMessage("Password reset is unavailable right now. Try again in a moment.");
    }
  };

  const handleResendVerification = async () => {
    const emailValue = getEmailForApi(email);
    if (!emailValue) {
      setMessageTone("error");
      setMessage("Enter your account email first.");
      return;
    }
    try {
      await fetch(resendVerificationEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue })
      });
      setMessageTone("success");
      setMessage("If that account needs verification, a new link has been sent.");
    } catch {
      setMessageTone("error");
      setMessage("Could not resend verification right now.");
    }
  };

  const isSignupStepTwo = mode === "signup" && signupStep === 2;
  const isSignupStepThree = mode === "signup" && signupStep === 3;

  return (
    <div className="site auth-page">
      <header className="site-header">
        <div className="brand">
          <Image
            src="/unbounded.jpeg"
            alt="Unbounded logo"
            width={56}
            height={56}
            priority
          />
          <a className="brand-text brand-home-link" href="/">
            <span>Unbounded</span>
          </a>
        </div>
        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/arbitrage">Arbitrage</a>
          <a href="/positive-ev">Value Bets</a>
          <a href="/billing">Pricing</a>
          <a href="/tutorials">Tutorials</a>
        </nav>
      </header>
      <main>
        <div className="auth-shell">
          <section className="auth-panel">
            <div className="auth-panel-topline">
              <div className="auth-step-marker">
                {mode === "login"
                  ? "Account access"
                  : `Signup step ${signupStep} of 3`}
              </div>
              {isSignupStepTwo ? (
                <button
                  type="button"
                  className="auth-skip"
                  onClick={() => goToTutorialStep(true)}
                  disabled={isSubmitting}
                >
                  Skip
                </button>
              ) : null}
            </div>

            <h1>
              {mode === "login"
                ? "Log in to Unbounded"
                : signupStep === 1
                  ? "Create your account"
                  : signupStep === 2
                    ? "Finish your setup"
                    : "Recommended tutorials"}
            </h1>

            <p className="auth-subtitle">
              {mode === "login"
                ? "Use the account you already created to continue into the dashboard."
                : signupStep === 1
                  ? "Start with your account details. You can set books and goals on the next screen."
                  : signupStep === 2
                    ? `Choose the sportsbooks and betting preferences that fit ${signupForm.state || "your market"}.`
                    : `Based on your ${signupForm.experienceLevel || "current"} experience level, start here to learn the workflow faster.`}
            </p>

            <div className="auth-toggle-simple">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => handleModeChange("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => handleModeChange("signup")}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form-simple" onSubmit={handleSubmit}>
              {mode === "login" ? (
                <>
                  <label className="field">
                    <span>Email, phone, or username</span>
                    <input
                      name="email"
                      type="text"
                      placeholder="Email, phone, or username"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(event) => {
                        const nextEmail = event.target.value;
                        setEmail(nextEmail);
                        if (rememberEmail) {
                          localStorage.setItem(SAVED_EMAIL_KEY, nextEmail.trim());
                        }
                      }}
                    />
                  </label>

                  <label className="field">
                    <span>Password</span>
                    <div className="field-input">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                            <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                            <path d="M4 4 20 20" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                            <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="remember-field">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(event) => {
                        const nextChecked = event.target.checked;
                        setRememberEmail(nextChecked);
                        if (nextChecked && email) {
                          localStorage.setItem(SAVED_EMAIL_KEY, email.trim());
                        } else {
                          localStorage.removeItem(SAVED_EMAIL_KEY);
                        }
                      }}
                    />
                    <span>Remember email on this device</span>
                  </label>
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={() => {
                      setForgotIdentifier(email);
                      setForgotMessage(null);
                      setIsForgotPasswordOpen(true);
                    }}
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={handleResendVerification}
                  >
                    Resend verification email
                  </button>
                </>
              ) : signupStep === 1 ? (
                <>
                  <div className="auth-grid auth-grid--signup">
                    <div className="field-stack">
                      <label className="field">
                        <span>Email or mobile number</span>
                        <input
                          type="text"
                          placeholder="you@example.com or +1 555 555 5555"
                          autoComplete="username"
                          required
                          value={signupForm.email}
                          onChange={(event) =>
                            updateSignupField("email", event.target.value)
                          }
                        />
                      </label>

                      <div className="auth-tier-picker">
                        <div className="auth-tier-picker-head">
                          <span>Choose tier</span>
                          <p>Select, Premium, or Executive.</p>
                        </div>
                        <div className="auth-tier-grid">
                          {TIER_OPTIONS.map((tier) => {
                            const isSelected = signupForm.tier === tier.value;
                            return (
                              <button
                                key={tier.value}
                                type="button"
                                className={`auth-tier-card auth-tier-card--${tier.accent}${isSelected ? " is-selected" : ""
                                  }`}
                                aria-pressed={isSelected}
                                onClick={() => updateSignupField("tier", tier.value)}
                              >
                                <span className="auth-tier-crown" aria-hidden="true">
                                  <svg viewBox="0 0 24 24">
                                    <path d="M3 18h18l-2-9-5 4-2-7-2 7-5-4-2 9Z" />
                                  </svg>
                                </span>
                                <span className="auth-tier-label">{tier.label}</span>
                                <span className="auth-tier-description">
                                  {tier.description}
                                </span>
                                <span className="auth-tier-features">
                                  {tier.features.map((feature) => (
                                    <span key={feature}>{feature}</span>
                                  ))}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="field-stack">
                      <label className="field">
                        <span>Username</span>
                        <input
                          type="text"
                          placeholder="Pick a username"
                          autoComplete="username"
                          required
                          maxLength={MAX_USERNAME_LENGTH}
                          value={signupForm.username}
                          onChange={(event) =>
                            updateSignupField("username", event.target.value)
                          }
                        />
                      </label>

                      <label className="field">
                        <span>Promo code</span>
                        <input
                          type="text"
                          placeholder="Optional promo code"
                          autoComplete="off"
                          value={signupForm.promoCode}
                          onChange={(event) =>
                            updateSignupField("promoCode", event.target.value)
                          }
                        />
                      </label>

                      <label className="field">
                        <span>Date of Birth</span>
                        <input
                          type="date"
                          required
                          max={todayIso}
                          value={signupForm.dateOfBirth}
                          onChange={(event) =>
                            updateSignupField("dateOfBirth", event.target.value)
                          }
                        />
                      </label>
                    </div>

                    <label className="field">
                      <span>Country</span>
                      <select
                        required
                        value={signupForm.country}
                        onChange={(event) =>
                          updateSignupField("country", event.target.value)
                        }
                      >
                        {COUNTRY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>{regionLabel}</span>
                      <select
                        required
                        value={signupForm.state}
                        onChange={(event) =>
                          updateSignupField("state", event.target.value)
                        }
                      >
                        <option value="">Select {regionLabel.toLowerCase()}</option>
                        {regionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="auth-grid auth-grid-tight">
                    <label className="field">
                      <span>Password</span>
                      <div className="field-input field-input--with-info">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          autoComplete="new-password"
                          required
                          maxLength={MAX_PASSWORD_LENGTH}
                          value={signupForm.password}
                          onChange={(event) =>
                            updateSignupField("password", event.target.value)
                          }
                        />
                        {signupForm.password ? null : (
                          <div className="auth-requirements">
                            <button
                              type="button"
                              className="auth-requirements-trigger"
                              aria-label="Password requirements"
                            >
                              i
                            </button>
                            <div className="auth-requirements-popover">
                              <strong>Password requirements</strong>
                              <ul>
                                {PASSWORD_REQUIREMENTS.map((requirement) => (
                                  <li key={requirement}>{requirement}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          className="password-toggle"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          {showPassword ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                              <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                              <path d="M4 4 20 20" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                              <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="field">
                      <span>Confirm password</span>
                      <div className="field-input">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                          required
                          maxLength={MAX_PASSWORD_LENGTH}
                          value={signupForm.confirmPassword}
                          onChange={(event) =>
                            updateSignupField("confirmPassword", event.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          onClick={() =>
                            setShowConfirmPassword((current) => !current)
                          }
                        >
                          {showConfirmPassword ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                              <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                              <path d="M4 4 20 20" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M2 12c2.7-4.4 6.8-6.7 10-6.7 3.2 0 7.3 2.3 10 6.7-2.7 4.4-6.8 6.7-10 6.7-3.2 0-7.3-2.3-10-6.7Z" />
                              <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </label>
                  </div>

                  <div className="field-hint">
                    Use a capital letter, at least 10 characters and include at least one symbol.
                  </div>

                  <label className="remember-field remember-field--signup">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(event) => {
                        const nextChecked = event.target.checked;
                        setRememberEmail(nextChecked);
                        if (nextChecked && signupForm.email) {
                          localStorage.setItem(
                            SAVED_EMAIL_KEY,
                            signupForm.email.trim()
                          );
                        } else {
                          localStorage.removeItem(SAVED_EMAIL_KEY);
                        }
                      }}
                    />
                    <span>Remember this account on this device</span>
                  </label>
                </>
              ) : isSignupStepTwo ? (
                <>
                  <div className="auth-section">
                    <div className="auth-section-head">
                      <div>
                        <strong>Preferred sportsbooks</strong>
                        <p>
                          Legal books for your selected market are highlighted first,
                          but you can choose any combination.
                        </p>
                      </div>
                      <div className="auth-selection-count">
                        {selectedSportsbooks.length} selected
                      </div>
                    </div>

                    <div className="auth-section-toolbar">
                      <label className="auth-section-search">
                        <input
                          type="search"
                          placeholder="Search sportsbooks"
                          value={sportsbookSearch}
                          onChange={(event) => {
                            setSportsbookSearch(event.target.value);
                            setShowAllSportsbooks(true);
                          }}
                        />
                      </label>
                      <div className="auth-section-actions">
                        <button
                          type="button"
                          className="auth-section-action"
                          onClick={() =>
                            setSelectedSportsbooks((current) =>
                              allFilteredSportsbooksSelected
                                ? current.filter(
                                    (sportsbook) =>
                                      !filteredSportsbookOptions.includes(sportsbook)
                                  )
                                : uniqueValues([
                                    ...current,
                                    ...filteredSportsbookOptions
                                  ])
                            )
                          }
                        >
                          {allFilteredSportsbooksSelected
                            ? "Deselect all"
                            : "Select all"}
                        </button>
                        {filteredSportsbookOptions.length > INITIAL_VISIBLE_SPORTSBOOKS &&
                        !sportsbookSearch.trim() ? (
                          <button
                            type="button"
                            className="auth-section-action"
                            onClick={() =>
                              setShowAllSportsbooks((current) => !current)
                            }
                          >
                            {showAllSportsbooks ? "Less" : "More"}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="auth-chip-grid">
                      {visibleSportsbookOptions.map((sportsbook) => {
                        const isSelected = selectedSportsbooks.includes(sportsbook);
                        const isLegal = legalSportsbooks.includes(sportsbook);
                        const sportsbookMeta = getSportsbookMeta(sportsbook);
                        return (
                          <button
                            key={sportsbook}
                            type="button"
                            className={`auth-chip ${isSelected ? "selected" : ""} ${isLegal ? "legal" : ""}`}
                            onClick={() => toggleSportsbook(sportsbook)}
                          >
                            <span className="auth-chip-main">
                              <SportsbookLogo sportsbook={sportsbook} size={32} />
                              <span className="auth-chip-copy">
                                <span>{sportsbook}</span>
                                <span className="auth-chip-domain">
                                  {new URL(sportsbookMeta.siteHref).hostname.replace(/^www\./, "")}
                                </span>
                              </span>
                            </span>
                            <span className="auth-chip-meta">
                              {isLegal ? (
                                <span className="auth-chip-note">Legal</span>
                              ) : null}
                              {isSelected ? (
                                <span className="auth-chip-selected">Selected</span>
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {visibleSportsbookOptions.length === 0 ? (
                      <div className="field-hint">
                        No sportsbooks match that search.
                      </div>
                    ) : null}
                  </div>

                  <div className="auth-grid">
                    <label className="field">
                      <span>Max bet</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="250"
                        required
                        value={signupForm.maxBet}
                        onChange={(event) =>
                          updateSignupField("maxBet", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Experience level</span>
                      <select
                        required
                        value={signupForm.experienceLevel}
                        onChange={(event) =>
                          updateSignupField("experienceLevel", event.target.value)
                        }
                      >
                        <option value="">Select level</option>
                        {EXPERIENCE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Yearly profit target</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="5000"
                        required
                        value={signupForm.yearlyProfitTarget}
                        onChange={(event) =>
                          updateSignupField("yearlyProfitTarget", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Bet frequency</span>
                      <select
                        required
                        value={signupForm.betFrequency}
                        onChange={(event) =>
                          updateSignupField("betFrequency", event.target.value)
                        }
                      >
                        <option value="">Select frequency</option>
                        {BET_FREQUENCY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="field">
                    <span>Betting goal</span>
                    <select
                      required
                      value={signupForm.bettingGoal}
                      onChange={(event) =>
                        updateSignupField("bettingGoal", event.target.value)
                      }
                    >
                      <option value="">Select a goal</option>
                      {GOAL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <div className="auth-tutorial-stage">
                  <div className="auth-tutorial-frame">
                    <div className="auth-tutorial-card">
                      <span className="auth-tutorial-eyebrow">
                        {activeTutorial.eyebrow}
                      </span>
                      <h2>{activeTutorial.title}</h2>
                      <p>{activeTutorial.description}</p>

                      <div className="auth-tutorial-meta">
                        <span>{activeTutorial.duration}</span>
                        <span>{signupForm.experienceLevel || "General track"}</span>
                      </div>

                      <ul className="auth-tutorial-points">
                        {activeTutorial.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="auth-tutorial-footer">
                    <div className="auth-tutorial-nav">
                      <button
                        type="button"
                        className="auth-tutorial-arrow"
                        onClick={() =>
                          setTutorialIndex((current) =>
                            current === 0 ? recommendedTutorials.length - 1 : current - 1
                          )
                        }
                        aria-label="Previous tutorial"
                      >
                        ←
                      </button>

                      <div className="auth-tutorial-dots" aria-label="Tutorial selection">
                        {recommendedTutorials.map((tutorial, index) => (
                          <button
                            key={tutorial.title}
                            type="button"
                            className={`auth-tutorial-dot ${index === tutorialIndex ? "active" : ""}`}
                            onClick={() => setTutorialIndex(index)}
                            aria-label={`Show tutorial ${index + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        className="auth-tutorial-arrow"
                        onClick={() =>
                          setTutorialIndex((current) =>
                            current === recommendedTutorials.length - 1 ? 0 : current + 1
                          )
                        }
                        aria-label="Next tutorial"
                      >
                        →
                      </button>
                    </div>

                    <button
                      type="button"
                      className="auth-link-chip"
                      onClick={() => void completeSignup(true)}
                      disabled={isSubmitting}
                    >
                      Skip tutorials
                    </button>
                  </div>
                </div>
              )}

              {passwordError ? <div className="field-error">{passwordError}</div> : null}

              <div className="auth-form-actions">
                {mode === "signup" && signupStep > 1 ? (
                  <button
                    type="button"
                    className="auth-secondary"
                    onClick={() =>
                      setSignupStep((current) => (current === 3 ? 2 : 1))
                    }
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                ) : null}

                <button className="auth-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Working..."
                    : mode === "login"
                      ? "Continue"
                      : signupStep === 1
                        ? "Continue signup"
                        : signupStep === 2
                          ? "Next"
                          : "Create account"}
                </button>
              </div>
            </form>

            {message ? (
              <div className={`auth-message ${messageTone}`}>{message}</div>
            ) : null}

            {isForgotPasswordOpen ? (
              <div
                className="auth-dialog-backdrop"
                role="presentation"
                onClick={() => setIsForgotPasswordOpen(false)}
              >
                <section
                  className="auth-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="forgot-password-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="newsletter-modal-close"
                    aria-label="Close password reset"
                    onClick={() => setIsForgotPasswordOpen(false)}
                  >
                    ×
                  </button>
                  <span className="billing-eyebrow">Account recovery</span>
                  <h2 id="forgot-password-title">Reset your password</h2>
                  <p>
                    Enter the email on your account. Username and phone recovery
                    will route through that email.
                  </p>
                  <form
                    className="auth-dialog-form"
                    onSubmit={handleForgotPasswordSubmit}
                  >
                    <label className="field">
                      <span>Email, phone, or username</span>
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(event) =>
                          setForgotIdentifier(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="username"
                        required
                      />
                    </label>
                    {forgotMessage ? (
                      <div className="auth-message info">{forgotMessage}</div>
                    ) : null}
                    <button className="auth-primary" type="submit">
                      Send reset instructions
                    </button>
                  </form>
                </section>
              </div>
            ) : null}

            <div className="auth-actions" />
          </section>
        </div>
      </main>
    </div>
  );
}
