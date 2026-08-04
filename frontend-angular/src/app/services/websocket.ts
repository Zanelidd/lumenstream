import { Injectable } from '@angular/core';
import { fromEvent, map, merge, Observable, share } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Measurement } from '../models/measurement';

@Injectable({
  providedIn: 'root',
})
export class Websocket {
  private readonly socket: Socket = io('http://localhost:3000');

  readonly measurements$: Observable<Measurement> = fromEvent<Measurement>(
    this.socket,
    'measurement',
  ).pipe(share());

  readonly alerts$ = fromEvent<Measurement>(this.socket, 'alert').pipe(share());

  readonly connected$: Observable<boolean> = merge(
    fromEvent(this.socket, 'connect').pipe(map(() => true)),
    fromEvent(this.socket, 'disconnect').pipe(map(() => false)),
  ).pipe(share());
}
