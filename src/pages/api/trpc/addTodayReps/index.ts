 //test add reps
 async function addTodayReps(user: any, newToday: Date, useUpdateReps: any) {
    //create today pushups reps session for user and record to db
    try {
      await useUpdateReps.mutateAsync({
        userId: user!.id,
        reps: 0,
        date: newToday,
      });
      console.log("send");
    } catch (error) {
      console.log(error);
    }
  }

  export default addTodayReps;