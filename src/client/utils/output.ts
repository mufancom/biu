export function appendOutput(
  output: string | undefined,
  suffix: string,
  dataType?: string,
): string {
  if (dataType) {
    suffix = `<div data-type="${dataType}">${suffix}</div>`;
  }

  if (output) {
    return output + suffix;
  } else {
    return suffix;
  }
}

export function outputWarning(text: string): string {
  return `<span style="color:#E6A23C">${text}</span>`;
}

export function outputError(text: string): string {
  return `<span style="color:#F56C6C">${text}</span>`;
}

export function outputSuccess(text: string): string {
  return `<span style="color:#67C23A">${text}</span>`;
}

export function outputInfo(text: string): string {
  return `<span style="color:#909399">${text}</span>`;
}
