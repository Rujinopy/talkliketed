 //test add reps
 async function updateRepsForUser(user: any, newToday: Date,  reps: number, useMutation: any) {
    //create today pushups reps session for user and record to db
    try {
      await useMutation.mutateAsync({
        userId: user!.id,
        reps: reps,
        date: newToday,
      });
      console.log("send");
    } catch (error) {
      console.log(error);
    }
  }

  export default updateRepsForUser;