import { UserService } from "./UserService";
import { User } from "@/api/lib/domain/user/User";
import { UserId } from "@/api/lib/domain/user/UserId";
import { GoogleAuth } from "@/api/lib/domain/user/auth/GoogleAuth";
import { UserAuth } from "@/api/lib/domain/user/auth/UserAuth";
import { IUserRepository } from "@/api/lib/repository/IUserRepository";

describe("UserService", () => {
  const setup = () => {
    const userRepository: IUserRepository = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByAuth: jest.fn(),
      deleteUser: jest.fn(),
    };
    const userService = new UserService(userRepository);
    return { userRepository, userService };
  };

  describe("create", () => {
    it("should create a new user if user does not exist", async () => {
      const { userRepository, userService } = setup();
      const auth: UserAuth = new UserAuth({ google: new GoogleAuth("test") });
      jest.spyOn(userRepository, "getUserByAuth").mockResolvedValueOnce(null);
      jest.spyOn(userRepository, "createUser").mockResolvedValueOnce(undefined);

      const result = await userService.create(auth);

      expect(userRepository.getUserByAuth).toHaveBeenCalledWith(auth);
      expect(userRepository.createUser).toHaveBeenCalledTimes(1);
      expect(result.toJSON().auth).toEqual(auth.toJSON());
    });

    it("should throw an error if user already exists", async () => {
      const { userRepository, userService } = setup();
      const auth: UserAuth = new UserAuth({ google: new GoogleAuth("test") });
      jest
        .spyOn(userRepository, "getUserByAuth")
        .mockResolvedValueOnce(new User(new UserId("test"), auth));

      await expect(userService.create(auth)).rejects.toThrowError(
        "User already exists"
      );
    });
  });

  describe("getUser", () => {
    it("should return a user by userId", async () => {
      const { userRepository, userService } = setup();
      const userId = new UserId("test");
      const user = new User(
        userId,
        new UserAuth({ google: new GoogleAuth("test") })
      );
      jest.spyOn(userRepository, "getUserById").mockResolvedValueOnce(user);

      const result = await userService.getUser(userId);

      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });
  });

  describe("getUserByAuth", () => {
    it("should return a user by auth", async () => {
      const { userRepository, userService } = setup();
      const auth: UserAuth = new UserAuth({ google: new GoogleAuth("test") });
      const user = new User(new UserId("test"), auth);
      jest.spyOn(userRepository, "getUserByAuth").mockResolvedValueOnce(user);

      const result = await userService.getUserByAuth(auth);

      expect(userRepository.getUserByAuth).toHaveBeenCalledWith(auth);
      expect(result).toEqual(user);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user by userId", async () => {
      const { userRepository, userService } = setup();
      const userId = new UserId("test");
      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValueOnce(
          new User(userId, new UserAuth({ google: new GoogleAuth("test") }))
        );
      jest.spyOn(userRepository, "deleteUser").mockResolvedValueOnce(undefined);

      await userService.deleteUser(userId);

      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
    });

    it("should throw an error if user not found", async () => {
      const { userRepository, userService } = setup();
      const userId = new UserId("test");
      jest.spyOn(userRepository, "getUserById").mockResolvedValueOnce(null);

      await expect(userService.deleteUser(userId)).rejects.toThrowError(
        "User not found"
      );
    });
  });
});
