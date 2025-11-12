module.exports = [
  {
    name: "profile-certificates",
    description: "Strip /certificates from username profile URLs",
    pattern: {
      segments: ["*", "certificates"],
      stripSegments: [1],
    },
  },
];
