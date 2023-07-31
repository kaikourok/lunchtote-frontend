// バックエンド"entity/service/stylize.go"のTS版実装
// メンテナンス性を高めるため、コードの形が原版に近くなるよう実装すること

import escapeHtml from './escapeHtml';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

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

  const paths = url.split('/');
  if (paths.length != 3) {
    return false;
  }

  const characterDirectory = paths[1];
  if (isNaN(parseInt(characterDirectory, 10))) {
    return false;
  }

  const fileFullname = paths[2];
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

  const { before, inner, after, index } = splitTagSections(
    target.slice(0, sp),
    startTag,
    endTag
  );
  if (index == -1) {
    return {
      result: target,
      found: false,
    };
  }

  const url = inner.trim();
  if (!isImagePath(url)) {
    return {
      result: trimEnd(before, '<br>') + trimStart(after, '<br>'),
      found: true,
    };
  }

  return {
    result:
      trimEnd(before, '<br>') +
      `<img class="` +
      className +
      `" src="` +
      uploaderPath +
      url +
      `">` +
      trimStart(after, '<br>'),
    found: true,
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

const replaceBigImageCenterTag = (
  target: string
): { result: string; found: boolean } => {
  return replaceImageTag(target, '[img-b]', '[/img-b]', 'full-image');
};

const replaceBigImageLeftTag = (
  target: string
): { result: string; found: boolean } => {
  return replaceImageTag(
    target,
    '[img-lb]',
    '[/img-lb]',
    'full-image full-image-left'
  );
};

const replaceBigImageRightTag = (
  target: string
): { result: string; found: boolean } => {
  return replaceImageTag(
    target,
    '[img-rb]',
    '[/img-rb]',
    'full-image full-image-right'
  );
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

const replaceBigImageTagAll = (target: string): string => {
  let result = target;
  let found = false;

  do {
    const replaced = replaceBigImageCenterTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  do {
    const replaced = replaceBigImageLeftTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  do {
    const replaced = replaceBigImageRightTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  return result;
};

/*-------------------------------------------------------------------------------------------------
	MessageTag
-------------------------------------------------------------------------------------------------*/

const replaceMessageTag = (
  target: string
): { result: string; found: boolean } => {
  const nameStartTag = '[name]';
  const nameEndTag = '[/name]';
  const iconStartTag = '[icon]';
  const iconEndTag = '[/icon]';

  let sp = target.length;

  while (true) {
    const { before, inner, after, index } = splitTagSections(
      target.slice(0, sp),
      '[message]',
      '[/message]'
    );
    if (index == -1) {
      break;
    }
    sp = index;

    const lines = inner.split('<br>');
    let startEmptyLineCount: number = 0,
      endEmptyLineCount: number = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] == '') {
        startEmptyLineCount++;
      } else {
        break;
      }
    }

    for (let i = lines.length - 1; 0 <= i; i--) {
      if (lines[i] == '') {
        endEmptyLineCount++;
      } else {
        break;
      }
    }

    if (lines.length < startEmptyLineCount + endEmptyLineCount) {
      continue;
    }

    let b = '';

    let name = '';
    let icon = '';
    let added = false;

    for (
      let i = startEmptyLineCount;
      i < lines.length - endEmptyLineCount;
      i++
    ) {
      const line = lines[i];

      if (added) {
        b += '<br>';
      }

      if (line.startsWith(nameStartTag) && line.endsWith(nameEndTag)) {
        name =
          `<div class="message-name">` +
          line.slice(nameStartTag.length, line.length - nameEndTag.length) +
          `</div>`;
        continue;
      }

      if (line.startsWith(iconStartTag) && line.endsWith(iconEndTag)) {
        const parsed = line
          .slice(iconStartTag.length, line.length - iconEndTag.length)
          .trim();

        if (isImagePath(parsed)) {
          icon =
            `<div class="message-icon-wrapper"><img class="message-icon" src="` +
            uploaderPath +
            parsed +
            `"></div>`;
          continue;
        }
      }

      b += line;
      added = true;
    }

    let resultBuilder = '';

    resultBuilder += before.endsWith('<br>')
      ? before.slice(undefined, before.length - '<br>'.length)
      : before;
    resultBuilder += `<section class="message">`;
    if (icon != '') {
      resultBuilder += icon;
    } else {
      resultBuilder += `<div class="message-icon-wrapper"><div class="message-icon-noimage"></div></div>`;
    }
    resultBuilder += `<div class="message-content">`;
    resultBuilder += name;
    resultBuilder += `<div class="message-body">`;
    resultBuilder += b;
    resultBuilder += `</div>`;
    resultBuilder += `</div>`;
    resultBuilder += `</section>`;
    resultBuilder += after.startsWith('<br>')
      ? after.slice('<br>'.length)
      : after;

    return { result: resultBuilder, found: true };
  }

  return { result: target, found: false };
};

const replaceMessageTagAll = (target: string): string => {
  let result = target;
  let found = false;

  do {
    const replaced = replaceMessageTag(result);
    result = replaced.result;
    found = replaced.found;
  } while (found);

  return result;
};

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

export const stylizeBasic = (message: string) => {
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

export const stylizeTextEntry = (profile: string): string => {
  let s = profile;
  s = stylizeBasic(profile);
  s = s.replaceAll(/\[hr\]/g, `<hr class="message-hr">`);
  s = replaceBigImageTagAll(s);
  s = replaceMessageTagAll(s);
  return s;
};
