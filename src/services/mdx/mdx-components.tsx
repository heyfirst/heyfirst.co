import Link from "next/link";
import Image from "next/image";
import { PropsWithChildren } from "react";
import Note from "./note";

const CustomLink: React.FC<PropsWithChildren<{ href: string }>> = (props) => {
  const href = props.href;
  const isInternalLink = href && (href.startsWith("/") || href.startsWith("#"));

  if (isInternalLink) {
    return (
      <Link href={href}>
        <a {...props}>{props.children}</a>
      </Link>
    );
  }

  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {props.children}
    </a>
  );
};

const MDXComponents = {
  Image,
  a: CustomLink,
  Note,
};

export default MDXComponents;
