export const DEFAULT_TEMPLATE_1 = {
  employee: {
    name: "John Doe",
    position: "Software Engineer",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    biodata: {
      profile:
        "Experienced software engineer with a passion for building scalable web applications.",
      objective: "Seeking a challenging role in a dynamic organization.",
      placeOfBirth: "New York",
      dateOfBirth: "1990-01-01",
      gender: "Male",
    },
  },
  histories: {
    employment: [
      {
        employer: "Tech Corp",
        position: "Senior Developer",
        from: "2020",
        to: "Present",
      },
    ],
    certification: [
      {
        title: "AWS Certified Solutions Architect",
        provider: "Amazon Web Services",
        date: "2022-05-15",
        duration: "3 years",
        certificate: "Yes",
      },
    ],
    education: [
      {
        school: "State University",
        degree: "Bachelor of Science",
        subject: "Computer Science",
        from: "2008",
        to: "2012",
        GPA: "3.8",
      },
    ],
    project: [
      {
        projectName: "E-commerce Platform",
        role: "Lead Developer",
        from: "2021-01",
        to: "2021-12",
        customer: "Retail Giant",
        projectDescription: "Built a high-traffic e-commerce site.",
        technicalInformation: "React, Next.js, Node.js",
        jobDescription: "Managed team of 5 and architected the system.",
      },
    ],
  },
};

export const DEFAULT_TEMPLATE_2 = {
  employee: {
    name: "Jane Smith",
    position: "Data Scientist",
    email: "jane.smith@example.com",
    phone: "+1 987 654 321",
    linkedin: "https://linkedin.com/in/janesmith",
  },
  skills: [
    "Machine Learning: Scikit-learn, TensorFlow",
    "Data Analysis: Pandas, NumPy, SQL",
    "Programming: Python, R, Java",
  ],
  employment: [
    {
      company: "Data Insights Inc.",
      location: "San Francisco, CA",
      summary: "Leading data analytics firm.",
      skills: "Python, SQL, Tableau",
      positions: [
        {
          title: "Senior Data Scientist",
          duration: "2018 - Present",
          details: [
            {
              projectTitle: "Predictive Maintenance",
              bullets: [
                "Developed ML models predicting equipment failure.",
                "Reduced downtime by 30%.",
              ],
            },
          ],
        },
      ],
    },
  ],
  education: [
    {
      school: "Tech Institute",
      degree: "MS in Data Science",
      duration: "2015 - 2017",
    },
  ],
  certifications: ["Google Professional Data Engineer (2021)"],
};
