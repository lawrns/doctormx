// Auto-generated types for next-intl
// Generated on 2026-02-19T19:07:06.665Z

type Messages = {
  metadata: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
  };
  navigation: {
    home: string;
    doctors: string;
    specialties: string;
    about: string;
    contact: string;
    login: string;
    register: string;
    logout: string;
    dashboard: string;
    appointments: string;
    profile: string;
    settings: string;
    emergency: string;
    help: string;
    notifications: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    search: string;
    continue: string;
    back: string;
    next: string;
    submit: string;
    yes: string;
    no: string;
    confirm: string;
    success: string;
    warning: string;
    info: string;
    required: string;
    optional: string;
    view: string;
    download: string;
    share: string;
    copy: string;
    copied: string;
    minutes: string;
    hours: string;
    days: string;
    and: string;
    or: string;
    notAvailable: string;
    comingSoon: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    copyright: string;
    privacy: string;
    terms: string;
    support: string;
    faq: string;
    careers: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      forgotPassword: string;
      noAccount: string;
      registerLink: string;
      submit: string;
      success: string;
      error: string;
    };
    register: {
      title: string;
      subtitle: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      phone: string;
      acceptTerms: string;
      haveAccount: string;
      loginLink: string;
      submit: string;
      success: string;
      error: string;
    };
    logout: {
      title: string;
      confirm: string;
      submit: string;
      success: string;
    };
    forgotPassword: {
      title: string;
      subtitle: string;
      email: string;
      submit: string;
      success: string;
      backToLogin: string;
    };
    resetPassword: {
      title: string;
      newPassword: string;
      confirmPassword: string;
      submit: string;
      success: string;
    };
    errors: {
      invalidEmail: string;
      weakPassword: string;
      passwordMismatch: string;
      requiredField: string;
      invalidCredentials: string;
      accountLocked: string;
      sessionExpired: string;
    };
  };
  booking: {
    title: string;
    subtitle: string;
    steps: {
      selectDoctor: string;
      selectDate: string;
      confirm: string;
    };
    selectDoctor: {
      title: string;
      search: string;
      specialty: string;
      allSpecialties: string;
      rating: string;
      experience: string;
      price: string;
      availability: string;
      noResults: string;
      filters: {
        title: string;
        clear: string;
        apply: string;
      };
    };
    selectDate: {
      title: string;
      calendar: string;
      availableSlots: string;
      noSlots: string;
      morning: string;
      afternoon: string;
      evening: string;
      selectTime: string;
      duration: string;
      timezone: string;
    };
    confirm: {
      title: string;
      doctor: string;
      date: string;
      time: string;
      duration: string;
      price: string;
      total: string;
      notes: string;
      notesPlaceholder: string;
      terms: string;
      submit: string;
      modality: {
        title: string;
        video: string;
        inPerson: string;
      };
    };
    success: {
      title: string;
      message: string;
      emailSent: string;
      addToCalendar: string;
      viewDetails: string;
    };
    errors: {
      slotTaken: string;
      insufficientFunds: string;
      paymentFailed: string;
      pastDate: string;
    };
    upcoming: {
      title: string;
      noAppointments: string;
      joinCall: string;
      reschedule: string;
      cancel: string;
    };
    history: {
      title: string;
      noHistory: string;
      viewSummary: string;
      downloadReceipt: string;
    };
  };
  payment: {
    title: string;
    checkout: {
      title: string;
      summary: string;
      items: string;
      subtotal: string;
      tax: string;
      total: string;
      securePayment: string;
    };
    methods: {
      title: string;
      card: string;
      paypal: string;
      oxxo: string;
      spei: string;
    };
    card: {
      number: string;
      holder: string;
      expiry: string;
      cvc: string;
      saveCard: string;
    };
    oxxo: {
      title: string;
      instructions: string;
      generate: string;
      reference: string;
      amount: string;
      expires: string;
      download: string;
    };
    spei: {
      title: string;
      instructions: string;
      clabe: string;
      bank: string;
      reference: string;
      amount: string;
    };
    confirm: {
      title: string;
      processing: string;
      success: string;
      failed: string;
      tryAgain: string;
      contactSupport: string;
    };
    errors: {
      cardDeclined: string;
      insufficientFunds: string;
      expiredCard: string;
      invalidCard: string;
      '3dSecureFailed': string;
    };
    receipt: {
      title: string;
      download: string;
      email: string;
      print: string;
    };
  };
  doctor: {
    profile: {
      title: string;
      about: string;
      specialties: string;
      education: string;
      experience: string;
      certifications: string;
      languages: string;
      reviews: string;
      rating: string;
      patients: string;
      consultations: string;
      bookNow: string;
    };
    specialties: {
      general: string;
      cardiology: string;
      dermatology: string;
      endocrinology: string;
      gastroenterology: string;
      gynecology: string;
      neurology: string;
      nutrition: string;
      ophthalmology: string;
      orthopedics: string;
      pediatrics: string;
      psychology: string;
      psychiatry: string;
      urology: string;
      dentistry: string;
    };
    availability: {
      title: string;
      today: string;
      thisWeek: string;
      nextAvailable: string;
      noAvailability: string;
    };
    reviews: {
      title: string;
      ratingBreakdown: string;
      writeReview: string;
      noReviews: string;
      verified: string;
    };
  };
  emergency: {
    title: string;
    warning: string;
    subtitle: string;
    call911: string;
    urgentCare: {
      title: string;
      description: string;
    };
    availableDoctors: {
      title: string;
      description: string;
      waitTime: string;
    };
    symptoms: {
      title: string;
      severePain: string;
      bleeding: string;
      difficultyBreathing: string;
      chestPain: string;
      fever: string;
      other: string;
    };
    contacts: {
      title: string;
      emergency911: string;
      redCross: string;
      firefighters: string;
      police: string;
    };
    disclaimer: string;
  };
};

declare global {
  interface IntlMessages extends Messages {}
}

export {};
