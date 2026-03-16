import { Injectable } from '@angular/core';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export abstract class XmlParserService {
  abstract parse(xmlData: string): unknown;
}

@Injectable()
export class FastXmlParserService implements XmlParserService {
  parse(xmlData: string): unknown {
    const parser = new XMLParser({
      removeNSPrefix: true,
      numberParseOptions: { hex: false, leadingZeros: false },
    });
    return parser.parse(xmlData);
  }
}
