import { Download } from "lucide-react";

export default function AttachmentRow({
    title,
    href,
    anotherButtons = null,
    hrefTitle = "Download",
    hrefIcon = <Download className="size-4" />,
    hrefBlankTitle,
    targetBlank = true,
}) {
    return (
        <tr className="border-b border-gray-300/80 dark:border-gray-600/50">
            <td className="py-2 text-sm text-gray-700 dark:text-gray-300">
                {title}
            </td>
            <td className="py-2 pr-6 text-right">
                {anotherButtons}
                {href ? (
                    <a
                        href={href}
                        target={targetBlank ? "_blank" : undefined}
                        className="inline-flex items-center gap-2 text-gray-700 transition-colors dark:hover:text-blue-400 dark:text-gray-300 group hover:text-blue-600"
                    >
                        {hrefIcon}
                        <span className="text-sm">{hrefTitle}</span>
                    </a>
                ) : (
                    <>
                        {hrefBlankTitle && (
                            <span className="text-sm text-yellow-500 dark:text-yellow-400">
                                {hrefBlankTitle}
                            </span>
                        )}
                    </>
                )}
            </td>
        </tr>
    );
}
