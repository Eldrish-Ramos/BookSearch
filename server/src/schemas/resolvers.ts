import User from "../models/User.js"
import { AuthenticationError, signToken } from "../services/auth.js";

interface AddUserArgs {
  input:{
    username: string;
    email: string;
    password: string;
  }
}

interface LoginUserArgs {
  email: string;
  password: string;
}

interface addBookArgs{
  bookData:{
    authors: []
    description: String
    title: String
    image: String
    link: String
  }
}


const resolvers = {
    Query: {
      me: async (_parent: any, _args: any, context: any) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id }).populate('savedBooks');
        }
        throw new AuthenticationError('Could not authenticate user.');
      },
      },

    Mutation: {
      addUser: async (_parent: any, { input }: AddUserArgs) => {
        const user = await User.create({ ...input });
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      },
      
      login: async (_parent: any, { email, password }: LoginUserArgs) => {
       
        const user = await User.findOne({ email });
      
        
          throw new AuthenticationError('Could not authenticate user.');
        }
      
        
        const correctPw = await user.isCorrectPassword(password);
      
        
        if (!correctPw) {
          throw new AuthenticationError('Could not authenticate user.');
        }
      
        
        const token = signToken(user.username, user.email, user._id);
      
        
        return { token, user };
      },
      
      saveBook: async (_: any, { bookData }: addBookArgs, context: any) => {
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }
  
        return User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
      },
      
      removeBook: async (_: any, { bookId }: { bookId: string }, context: any) => {
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }
  
        if (!bookId) {
          throw new Error('Book ID is required'); 
        }
  
        return User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      },
        
    }
}
export default resolvers;