package org.apache.activemq.util;

/**
 * This concurrent data structure is used when the calling thread wants to wait until a counter gets to 0 but the counter
 * can go up and down (unlike a CountDownLatch which can only count down)
 */
public class CountdownLock {

    final Object counterMonitor = new Object();
    private int counter = 0;

    public void doWaitForZero() {
        synchronized(counterMonitor){
            try {
                if (counter > 0) {
                    counterMonitor.wait();
                }
            } catch (InterruptedException e) {
                return;
            }
        }
    }

    public void doDecrement() {
        synchronized(counterMonitor){
            counter--;
            if (counter == 0) {
                counterMonitor.notify();
            }
        }
    }

    public void doIncrement() {
        synchronized(counterMonitor){
            counter++;
        }
    }
}
