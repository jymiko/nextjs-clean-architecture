"use client";

// All icons normalized to 20x20 area centered at (25,25) within 50x50 viewBox

export function TotalDocumentsIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="50" height="50" rx="12" fill="#E9F5FE" />
      <path
        d="M31 15H19C17.9 15 17 15.9 17 17V33C17 34.1 17.9 35 19 35H31C32.1 35 33 34.1 33 33V17C33 15.9 32.1 15 31 15ZM29 31H21V29H29V31ZM29 27H21V25H29V27ZM29 23H21V21H29V23Z"
        fill="#4DB1D4"
      />
    </svg>
  );
}

export function PendingApprovalsIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="50" height="50" rx="12" fill="#FFF4D4" />
      <path
        d="M25 15C19.48 15 15 19.48 15 25C15 30.52 19.48 35 25 35C30.52 35 35 30.52 35 25C35 19.48 30.52 15 25 15ZM25 33C20.59 33 17 29.41 17 25C17 20.59 20.59 17 25 17C29.41 17 33 20.59 33 25C33 29.41 29.41 33 25 33ZM25.5 20H24V26L29.25 29.15L30 27.92L25.5 25.25V20Z"
        fill="#C08F2C"
      />
    </svg>
  );
}

export function ExpiringSoonIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="50" height="50" rx="12" fill="#FFD6CD" />
      <path
        d="M24 29H26V31H24V29ZM24 19H26V27H24V19ZM25 15C19.48 15 15 19.48 15 25C15 30.52 19.48 35 25 35C30.52 35 35 30.52 35 25C35 19.48 30.52 15 25 15ZM25 33C20.59 33 17 29.41 17 25C17 20.59 20.59 17 25 17C29.41 17 33 20.59 33 25C33 29.41 29.41 33 25 33Z"
        fill="#F24822"
      />
    </svg>
  );
}

export function NewSubmissionsIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="50" height="50" rx="12" fill="#DBFFE0" />
      <path
        d="M29 15H21C19.9 15 19 15.9 19 17V33C19 34.1 19.9 35 21 35H31C32.1 35 33 34.1 33 33V19L29 15ZM31 33H21V17H28V20H31V33ZM22 27V29H30V27H22ZM22 23V25H27V23H22Z"
        fill="#0E9211"
      />
    </svg>
  );
}
