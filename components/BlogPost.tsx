import Image from "next/image";
import Link from "next/link";

const BlogPost = ({ title, summary, slug, image }) => {
  return (
    <Link href={`/blog/${slug}`}>
      <a className="relative w-full transition hover:text-yellow-700">
        <div className="relative h-64 sm:h-80">
          <Image
            src={image}
            layout="fill"
            className="object-cover object-right"
          />
        </div>
        <div className="relative w-11/12 p-4 mx-auto mb-8 -mt-8 bg-white z-100">
          <div className="flex flex-col justify-between md:flex-row">
            <h4 className="w-full mb-2 text-lg font-medium text-gray-900 md:text-xl">
              {title}
            </h4>
          </div>
          <p className="text-gray-600">{summary}</p>
        </div>
      </a>
    </Link>
  );
};

export default BlogPost;
