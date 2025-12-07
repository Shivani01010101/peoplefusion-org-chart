import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Typed Redux hooks for use throughout the application
 *
 * These hooks provide type-safe access to the Redux store:
 * - useAppDispatch: Type-safe dispatch function
 * - useAppSelector: Type-safe selector hook
 *
 * Use these instead of plain useDispatch and useSelector for better TypeScript support
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
