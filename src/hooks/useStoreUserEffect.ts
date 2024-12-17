/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api"; 
import { useUserContext } from "@/context/UserContext";

type User = {
  _id: string;
  [key: string]: any; // Allows dynamic fields
};

export default function useStoreUserEffect(dynamicData?: any) {
  const { isAuthenticated } = useConvexAuth();
  const { updateUserId, updateSubOrgId, setData } = useUserContext();
  const storeUser = useMutation(api.users.store);

  // Local state for user data
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return; // Exit if user is not logged in

    // Store the user in the database
    async function createUser() {
      try {
        // Call the `storeUser` mutation with dynamic fields
        const result = await storeUser(dynamicData);

        // Handle both cases: result as full user object or just Id<"users">
        if (typeof result === "object" && result !== null && "_id" in result) {
          // Full user object returned
          const user = result as User;
          setUserInfo(user);
          setUserId(user._id);

          // Update UserContext with user information
          setData(user.tokenIdentifier, user._id);
          if (user.suborgId) updateSubOrgId(user.suborgId);

          // Save all dynamic fields to localStorage
          if (typeof window !== "undefined") {
            Object.entries(user).forEach(([key, value]) => {
              if (value !== undefined) localStorage.setItem(key, value.toString());
            });
          }
        } else if (typeof result === "string") {
          // Handle case where only an ID is returned
          setUserId(result);
          setData(result, result); // Assume tokenIdentifier is passed
        } else {
          throw new Error("Unexpected result type from storeUser mutation");
        }
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }

    createUser();
    return () => setUserId(null); // Cleanup function
  }, [isAuthenticated, storeUser, dynamicData, setData, updateSubOrgId]);

  return { userId, userInfo };
}
