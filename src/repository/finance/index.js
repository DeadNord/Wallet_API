const { Finance } = require('../../models');

async function getAllTransactionData({ limit, page }, user) {
  const { docs: transition, ...rest } = await Finance.paginate(
    { owner: user._id },
    { sort: { date: -1 }, limit, page },
  );
  return { transition, ...rest };
}
async function getTotalValue(user) {
  const data = await Finance.find({ owner: user._id }, { balance: 1 })
    .sort({
      date: -1,
    })
    .limit(1);

  return data;
}

async function addTransaction(id, body) {
  console.log('body', body);

  const { date, sum, type } = body;
  console.log('body.date :>> ', date);
  console.log('owner id :>> ', id);
  console.log('sum :>> ', sum);
  //
  const olderTrasactions = await Finance.find({
    owner: id,
    $and: [{ date: { $gt: date } }],
  });
  console.log('olderTrasactions :>> ', olderTrasactions);

  let newBalance = 0;

  const LastBefore = await Finance.find({
    owner: id,
    $and: [{ date: { $lt: date } }],
  })
    .sort({
      date: -1,
    })
    .limit(1);
  console.log('LastBefore :>> ', LastBefore);
  console.log('object', LastBefore.length);
  console.log('Last not exist :>> ', Boolean(LastBefore.length === 0));
  console.log('LastBefore.balance :>> ', LastBefore[0]?.balance);
  console.log('type', type, sum);

  const lastBalance = LastBefore[0]?.balance || 0;

  if (type === 'income') {
    const updateManyResult = await Finance.updateMany(
      {
        owner: id,
        $and: [{ date: { $gt: date } }],
      },
      { $inc: { balance: sum } },
      { new: true },
    );
    // console.log('updateManyResult :>> ', updateManyResult);

    lastBalance === 0 ? (newBalance = sum) : (newBalance = lastBalance + sum);
    // LastBefore.length === 0
    //   ? (newBalance = sum)
    //   : (newBalance = LastBefore.newBalance + sum);
    console.log('newBalance :>> ', newBalance);
  } else {
    const updateManyResult = await Finance.updateMany(
      {
        owner: id,
        $and: [{ date: { $gt: date } }],
      },
      { $inc: { balance: -sum } },
      { new: true },
    );
    // console.log('updateManyResult :>> ', updateManyResult);

    lastBalance === 0 ? (newBalance = -sum) : (newBalance = lastBalance - sum);
    console.log('newBalance :>> ', newBalance);
  }

  // const newTransaction = {
  //   ...body,
  //   owner: id,
  //   balance: newBalance,
  // };
  const newTransaction = await Finance.create({
    ...body,
    owner: id,
    balance: newBalance,
  });
  return newTransaction;

  // const updateManyResult = await Finance.updateMany(
  //   {
  //     owner: id,
  //     $and: [{ date: { $gt: date } }],
  //   },
  //   // { $or: [{ quantity: { $lt: 20 } }, { price: 10 }] },
  //   // {
  //   //   balance: {
  //   //     $cond: {
  //   //       if: { type: 'income' },
  //   //       then: { $inc: { balance: sum } },
  //   //       else: { $inc: { balance: -sum } },
  //   //     },
  //   //   },
  //   // },
  //   // {
  //   // $cond: {
  //   //   if: { true },
  //   //   then: { $inc: { balance: sum } },
  //   //   else: { $inc: { balance: -sum } },
  //   // },
  //   // },
  //   { $inc: { balance: sum } },
  //   { new: true },
  // );
  // console.log('updateManyResult :>> ', updateManyResult);

  //
  //
  //

  // const newTransaction = await Finance.create({
  //   ...body,
  //   owner: id,
  //   balance: '2000.00',
  // });
}

module.exports = {
  getAllTransactionData,
  getTotalValue,
  addTransaction,
};
