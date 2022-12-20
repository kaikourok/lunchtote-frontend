// バックエンド"entity/service/stylize.go"のTS版実装
// メンテナンス性を高めるため、コードの形が原版に近くなるよう実装すること

import escapeHtml from './escapeHtml';

const uploadPath = process.env.NEXT_PUBLIC_UPLOAD_PATH!;

/*-------------------------------------------------------------------------------------------------
	Util Functions
-------------------------------------------------------------------------------------------------*/

const trimStart = (s: string, remove: string): string => {
  if (s.startsWith(remove)) {
    return s.slice(remove.length);
  } else {
    return s;
  }
};

const trimEnd = (s: string, remove: string): string => {
  if (s.endsWith(remove)) {
    return s.slice(0, s.length - remove.length);
  } else {
    return s;
  }
};

const isImageFileName = (s: string): boolean => {
  return /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(
    s
  );
};

const isImagePath = (url: string): boolean => {
  const allowedExtensions = ['png', 'gif', 'jpg', 'jpeg'];
  const uploadPathDepth = (uploadPath.match(/\//g) || []).length;

  const prefixIndex = url.indexOf(uploadPath);
  if (prefixIndex != 0) {
    return false;
  }

  const paths = url.split('/');
  if (paths.length != 3 + uploadPathDepth) {
    return false;
  }

  const characterDirectory = paths[1 + uploadPathDepth];
  if (isNaN(parseInt(characterDirectory, 10))) {
    return false;
  }

  const fileFullname = paths[2 + uploadPathDepth];
  const extensionIndex = fileFullname.lastIndexOf('.');
  if (extensionIndex == -1) {
    return false;
  }

  const extension = fileFullname.slice(extensionIndex + 1);
  if (!allowedExtensions.includes(extension)) {
    return false;
  }

  const filename = fileFullname.slice(0, extensionIndex);

  return isImageFileName(filename);
};

const splitTagSections = (
  target: string,
  startTag: string,
  endTag: string
): {
  before: string;
  inner: string;
  after: string;
  index: number;
} => {
  const t = target.toLowerCase();
  let sp = t.length;

  while (true) {
    const startIndex = t.slice(0, sp).lastIndexOf(startTag);
    if (startIndex == -1) {
      break;
    }

    sp = startIndex;
    const endRangeStartIndex = t.slice(sp + startTag.length).indexOf(startTag);
    const endRangeEndIndex = t.slice(sp + startTag.length).indexOf(endTag);

    if (
      endRangeEndIndex == -1 ||
      (endRangeStartIndex != -1 && endRangeStartIndex < endRangeEndIndex)
    ) {
      continue;
    }

    return {
      before: target.slice(0, sp),
      inner: target.slice(
        sp + startTag.length,
        sp + startTag.length + endRangeEndIndex
      ),
      after: target.slice(
        sp + startTag.length + endRangeEndIndex + endTag.length
      ),
      index: sp,
    };
  }

  return {
    before: '',
    inner: '',
    after: '',
    index: -1,
  };
};

const replaceImageTag = (
  target: string,
  startTag: string,
  endTag: string,
  className: string
): { result: string; found: boolean } => {
  let sp = target.length;

  while (true) {
    const { before, inner, after, index } = splitTagSections(
      target.slice(0, sp),
      startTag,
      endTag
    );
    if (index == -1) {
      break;
    }

    sp = index;
    const url = inner.trim();
    if (!isImagePath(url)) {
      continue;
    }

    return {
      result:
        trimEnd(before, '<br>') +
        `<img class="` +
        className +
        `" src="` +
        url +
        `">` +
        trimStart(after + target.slice(sp), '<br>'),
      found: true,
    };
  }

  return {
    result: target,
    found: false,
  };
};

/*-------------------------------------------------------------------------------------------------
	GeneralTag
-------------------------------------------------------------------------------------------------*/

const replaceGeneralTag = (
  target: string,
  startTag: string,
  endTag: string,
  startTagTo: string,
  endTagTo: string
): { result: string; found: boolean } => {
  const { before, inner, after, index } = splitTagSections(
    target,
    startTag,
    endTag
  );
  if (index == -1) {
    return { result: target, found: false };
  }

  return {
    result: before + startTagTo + inner + endTagTo + after,
    found: true,
  };
};

const replaceGeneralTagAll = (
  target: string,
  startTag: string,
  endTag: string,
  startTagTo: string,
  endTagTo: string
) => {
  let result = target;
  let found = false;

  do {
    const replaced = replaceGeneralTag(
      result,
      startTag,
      endTag,
      startTagTo,
      endTagTo
    );

    result = replaced.result;
    found = replaced.found;
  } while (found);

  return result;
};

/*-------------------------------------------------------------------------------------------------
	ImageTag
-------------------------------------------------------------------------------------------------*/

const replaceImageCenterTag = (
  target: string
): { result: string; found: boolean } => {
  return replaceImageTag(target, '[img]', '[/img]', 'cutin');
};

const replaceImageLeftTag = (
  target: string
): { result: string; found: boolean } => {
  return replaceImageTag(target, '[img-l]', '[/img-l]', 'cutin cutin-left');
};

const replaceImageRightTag = (
  target: string
): { result: string; found: boolean } => {
  return replaceImageTag(target, '[img-r]', '[/img-r]', 'cutin cutin-right');
};

const replaceImageTagAll = (target: string): string => {
  let result = target;
  let found = false;

  do {
    const replaced = replaceImageCenterTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  do {
    const replaced = replaceImageLeftTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  do {
    const replaced = replaceImageRightTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  return result;
};

/*-------------------------------------------------------------------------------------------------
	MessageTag
-------------------------------------------------------------------------------------------------*/

// not implemented because unused

/*-------------------------------------------------------------------------------------------------
	RubyTag
-------------------------------------------------------------------------------------------------*/

const replaceRubyTag = (target: string): { result: string; found: boolean } => {
  const textStartTag = '[rt]';
  const textEndTag = '[/rt]';
  const rubyStartTag = '[rb]';
  const rubyEndTag = '[/rb]';

  let sp = target.length;

  while (true) {
    const { before, inner, after, index } = splitTagSections(
      target.slice(0, sp),
      textStartTag,
      rubyEndTag
    );

    if (index == -1) {
      break;
    }
    sp = index;

    const separatorIndex = inner.indexOf(textEndTag + rubyStartTag);
    if (separatorIndex == -1) {
      continue;
    }

    const text = inner.slice(0, separatorIndex);
    const ruby = inner.slice(
      separatorIndex + (textEndTag + rubyStartTag).length
    );

    return {
      result:
        before +
        `<ruby>` +
        text +
        `<rp>(</rp><rt>` +
        ruby +
        `</rt><rp>)</rp></ruby>` +
        after,
      found: true,
    };
  }

  return {
    result: target,
    found: false,
  };
};

const replaceRubyTagAll = (target: string): string => {
  let result = target;
  let found = false;

  do {
    const replaced = replaceRubyTag(result);
    result = replaced.result;
    found = replaced.found;

    break;
  } while (found);

  return result;
};

/*-------------------------------------------------------------------------------------------------
	ColorTag
-------------------------------------------------------------------------------------------------*/

const replaceColorTag = (
  target: string
): { result: string; found: boolean } => {
  const t = target.toLowerCase();
  let sp = t.length;

  const startIndexes = [...t.matchAll(/\[#[0-9a-f]{6}\]/g)]
    .map((match) => match.index)
    .filter((index) => typeof index == 'number') as number[];

  for (let i = startIndexes.length; i >= 0; i--) {
    const startIndex = startIndexes[i];
    const startColor = t.slice(startIndex + 1, startIndex + 1 + 6);

    const startTag = `[#${startColor}]`;
    const endTag = `[/#${startColor}]`;

    const endRangeStartIndex = t.slice(sp + startTag.length).indexOf(startTag);
    const endRangeEndIndex = t.slice(sp + startTag.length).indexOf(endTag);

    if (
      endRangeEndIndex == -1 ||
      (endRangeStartIndex != -1 && endRangeStartIndex < endRangeEndIndex)
    ) {
      continue;
    }

    return {
      result:
        target.slice(0, sp) +
        startTag +
        target.slice(
          sp + startTag.length,
          sp + startTag.length + endRangeEndIndex
        ) +
        endTag +
        target.slice(sp + startTag.length + endRangeEndIndex + endTag.length),
      found: true,
    };
  }

  return {
    result: target,
    found: false,
  };
};

const replaceColorTagAll = (target: string): string => {
  let result = target;
  let found = false;

  do {
    const replaced = replaceColorTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  return result;
};

/*-------------------------------------------------------------------------------------------------
	Publics
-------------------------------------------------------------------------------------------------*/

const stylizeBasic = (message: string) => {
  let s = message;
  s = escapeHtml(s);
  s = s.replaceAll('\n', '<br>');
  s = replaceGeneralTagAll(
    s,
    '[+]',
    '[/+]',
    `<span class="larger">`,
    `</span>`
  );
  s = replaceGeneralTagAll(
    s,
    '[-]',
    '[/-]',
    `<span class="smaller">`,
    `</span>`
  );
  s = replaceGeneralTagAll(s, '[b]', '[/b]', `<span class="bold">`, `</span>`);
  s = replaceGeneralTagAll(
    s,
    '[s]',
    '[/s]',
    `<span class="strike">`,
    `</span>`
  );
  s = replaceGeneralTagAll(
    s,
    '[i]',
    '[/i]',
    `<span class="italic">`,
    `</span>`
  );
  s = replaceGeneralTagAll(
    s,
    '[u]',
    '[/u]',
    `<span class="underline">`,
    `</span>`
  );
  s = replaceColorTagAll(s);
  s = replaceRubyTagAll(s);
  s = replaceImageTagAll(s);

  return s;
};

export const stylizeMessagePreview = (message: string): string => {
  let s = message;
  s = stylizeBasic(s);
  s = s.replaceAll(/\[d6\]/g, `<span class="dice d6">0</span>`);
  s = s.replaceAll(/\[d100\]/g, `<span class="dice d100">00</span>`);

  return s;
};
