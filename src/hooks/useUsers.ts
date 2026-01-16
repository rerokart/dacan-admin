"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userService,
  type User,
  type UserFilters,
} from "@/services/user.service";
import { useToast } from "@/components/ui/toast";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
};

// Get Users
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userService.getUsers(filters),
  });
};

// Get User by ID
export const useUser = (id: string | number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

// Block User
export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => userService.blockUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success("User blocked successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to block user");
    },
  });
};

// Unblock User
export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => userService.unblockUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success("User unblocked successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to unblock user");
    },
  });
};

// Toggle User Block Status
export const useToggleUserBlock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string | number; isActive: boolean }) =>
      isActive ? userService.blockUser(id) : userService.unblockUser(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast.success(
        variables.isActive
          ? "User blocked successfully!"
          : "User unblocked successfully!"
      );
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update user status");
    },
  });
};
