const usersArr = [
  {
    id: 1,
    name: "user 1",
  },
  {
    id: 2,
    name: "user 2",
  },
  {
    id: 3,
    name: "user 3",
  },
  {
    id: 4,
    name: "user 4",
  },
];

const users = (req, res) => {
  return res.status(200).json(usersArr);
};

export { users };
